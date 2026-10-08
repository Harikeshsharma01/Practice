#!/usr/bin/env python3
"""Build an installable preview using official Android SDK tools on Linux x86_64.

Requires Python 3.9+ and Java 17+ (jdk.compiler and keytool). Signing material
stays in ignored .android-private; retain it privately for subsequent updates.
"""
from pathlib import Path
import hashlib
import os
import platform
import secrets
import shutil
import subprocess
import urllib.request
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SDK = Path(os.environ.get("SEWESTIAN_ANDROID_SDK", ROOT / ".android-sdk")).resolve()
BUILD = ROOT / "android/.build"
PRIVATE = ROOT / ".android-private"
OUTPUT = ROOT / "releases/Sewestian-1.0-preview.apk"
PACKAGES = [
    ("platform-36_r02.zip", "2c1a80dd4d9f7d0e6dd336ec603d9b5c55a6f576",
     "platforms", "platforms/android-36/android.jar"),
    ("build-tools_r36_linux.zip", "b0b6376977657e8ad9b969bacf4093601da2c6fb",
     "build-tools", "build-tools/android-16/lib/d8.jar"),
]


def run(args, **kwargs):
    subprocess.run([str(a) for a in args], check=True, cwd=ROOT, **kwargs)


def ensure_sdk():
    if platform.system() != "Linux" or platform.machine() not in ("x86_64", "AMD64"):
        raise SystemExit("Standalone builds require Linux x86_64. Use Android Studio elsewhere.")
    for name, checksum, directory, sentinel in PACKAGES:
        if (SDK / sentinel).exists():
            continue
        archive = SDK / "downloads" / name
        archive.parent.mkdir(parents=True, exist_ok=True)
        if not archive.exists():
            print("Downloading official Android SDK:", name, flush=True)
            urllib.request.urlretrieve("https://dl.google.com/android/repository/" + name, archive)
        if hashlib.sha1(archive.read_bytes()).hexdigest() != checksum:
            raise SystemExit("SDK checksum mismatch: " + name + "; delete this download and retry.")
        target = SDK / directory
        target.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive) as z:
            for entry in z.infolist():
                if not (target / entry.filename).resolve().is_relative_to(target.resolve()):
                    raise SystemExit("Unsafe SDK archive path")
            z.extractall(target)
            for entry in z.infolist():
                if not entry.is_dir():
                    (target / entry.filename).chmod((entry.external_attr >> 16) & 0o777 or 0o644)


for program in ("java", "keytool"):
    if not shutil.which(program):
        raise SystemExit(program + " is required (Java 17+ with the jdk.compiler module).")
ensure_sdk()
TOOLS = SDK / "build-tools/android-16"
JAR = SDK / "platforms/android-36/android.jar"
APP = ROOT / "android/app/src/main"
for generated in ("classes", "generated", "dex", "policy-test"):
    directory = BUILD / generated
    if directory.exists():
        shutil.rmtree(directory)
    directory.mkdir(parents=True)

compiler = ["java", "-m", "jdk.compiler/com.sun.tools.javac.Main"]
run([*compiler, "-d", BUILD / "policy-test",
     APP / "java/com/sewestian/learning/ConnectionPolicy.java", ROOT / "android/ConnectionPolicyTest.java"])
run(["java", "-cp", BUILD / "policy-test", "ConnectionPolicyTest"])
ET.register_namespace("android", "http://schemas.android.com/apk/res/android")
manifest = ET.parse(APP / "AndroidManifest.xml")
manifest.getroot().set("package", "com.sewestian.learning")
manifest.write(BUILD / "AndroidManifest.xml", encoding="utf-8", xml_declaration=True)
run([TOOLS / "aapt2", "compile", "--dir", APP / "res", "-o", BUILD / "resources.zip"])
run([TOOLS / "aapt2", "link", "-o", BUILD / "resources.apk", "-I", JAR,
     "--manifest", BUILD / "AndroidManifest.xml", "--java", BUILD / "generated",
     "--min-sdk-version", "26", "--target-sdk-version", "36",
     "--version-code", "1", "--version-name", "1.0-preview", BUILD / "resources.zip"])
sources = list((APP / "java").rglob("*.java")) + list((BUILD / "generated").rglob("*.java"))
run([*compiler, "-source", "8", "-target", "8", "-encoding", "UTF-8",
     "-classpath", JAR, "-d", BUILD / "classes", *sources])
with zipfile.ZipFile(BUILD / "classes.jar", "w", zipfile.ZIP_DEFLATED) as z:
    for p in (BUILD / "classes").rglob("*.class"):
        z.write(p, p.relative_to(BUILD / "classes"))
run(["java", "-cp", TOOLS / "lib/d8.jar", "com.android.tools.r8.D8", "--release",
     "--min-api", "26", "--lib", JAR, "--output", BUILD / "dex", BUILD / "classes.jar"])
shutil.copyfile(BUILD / "resources.apk", BUILD / "unsigned.apk")
with zipfile.ZipFile(BUILD / "unsigned.apk", "a", zipfile.ZIP_DEFLATED) as z:
    for p in (BUILD / "dex").glob("*.dex"):
        z.write(p, p.name)
run([TOOLS / "zipalign", "-f", "-p", "4", BUILD / "unsigned.apk", BUILD / "aligned.apk"])

PRIVATE.mkdir(exist_ok=True, mode=0o700)
password = PRIVATE / "signing-password"
keystore = PRIVATE / "preview-signing.p12"
if keystore.exists() and not password.exists():
    raise SystemExit("Restore the signing-password file for the existing keystore before building.")
if not password.exists():
    password.write_text(secrets.token_urlsafe(32))
    password.chmod(0o600)
if not keystore.exists():
    run(["keytool", "-genkeypair", "-keystore", keystore, "-storetype", "PKCS12",
         "-storepass:file", password, "-keypass:file", password, "-alias", "sewestian-preview",
         "-keyalg", "RSA", "-keysize", "3072", "-validity", "3650",
         "-dname", "CN=Sewestian Preview, OU=Development"], stdout=subprocess.DEVNULL)
    keystore.chmod(0o600)
OUTPUT.parent.mkdir(exist_ok=True)
# PKCS12 uses the store password for the private key; apksigner reuses it.
run(["java", "-jar", TOOLS / "lib/apksigner.jar", "sign", "--ks", keystore,
     "--ks-key-alias", "sewestian-preview", "--ks-pass", "file:" + str(password),
     "--out", OUTPUT, BUILD / "aligned.apk"])
run(["java", "-jar", TOOLS / "lib/apksigner.jar", "verify", "--verbose", OUTPUT])
run([TOOLS / "zipalign", "-c", "-p", "4", OUTPUT])
sha = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
OUTPUT.with_suffix(".apk.sha256").write_text(sha + "  " + OUTPUT.name + "\n")
print(f"Built {OUTPUT.name}: {OUTPUT.stat().st_size:,} bytes; SHA-256 {sha}")
print("Signing key retained only in ignored .android-private/. Back it up privately before replacing the workspace.")
