<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Random" %>
<%@ page import="java.util.HashMap" %>
<%
    int elephantCount = 0;
    int tortoiseCount = 0;
    int deerCount = 0;
    int count = 0;
    Random rand = new Random();
    String countParam = request.getParameter("count");
    if (countParam != null && !countParam.isEmpty()) {
        count = Integer.parseInt(countParam);
    }
    count++;
    ArrayList<String> animalList = new ArrayList<>();
    animalList.add("Elephant");
    animalList.add("Tortoise");
    animalList.add("Deer");
    String selectedAnimal = animalList.get(rand.nextInt(animalList.size()));
    ArrayList<String> crossed = (ArrayList<String>) session.getAttribute("crossed");
    if (crossed == null) {
        crossed = new ArrayList<>();
    }
    crossed.add(selectedAnimal);
    session.setAttribute("crossed", crossed);
    HashMap<String, Integer> animalTimes = new HashMap<>();
    animalTimes.put("Elephant", 5);
    animalTimes.put("Tortoise", 30);
    animalTimes.put("Deer", 3);
    int totalTime = 0;
    for (String animal : crossed) {
        totalTime += animalTimes.get(animal); 
    }
    for (String animal : crossed) {
        if (animal.equals("Elephant")) {
            elephantCount++;
        } else if (animal.equals("Tortoise")) {
            tortoiseCount++;
        } else if (animal.equals("Deer")) {
            deerCount++;
        }
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Animal Creator</title>
</head>
<body>
<h1>Animal Creator</h1>
<%
    if (count < 5) {
%>
    <form action="process.jsp" method="get">
        <input type="hidden" name="count" value="<%= count %>">
        <button type="submit">Go</button>
    </form>
<%
    } else {
%>
    <h2>Total Time: <%= totalTime %> minutes</h2>
    <h2>Number of Elephants: <%= elephantCount %></h2>
    <h2>Number of Tortoises: <%= tortoiseCount %></h2>
    <h2>Number of Deers: <%= deerCount %></h2>
<%
    }
%>
</body>
</html>