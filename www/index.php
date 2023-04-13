<?php
  /* Connect to MySQL database */
  mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
  $mysqli = new mysqli("localhost", "root", "", "test");
  
  /* Set the desired charset after establishing a connection */
  $mysqli->set_charset("utf8mb4");
  
  /* Retrieve random value */
  $result = $mysqli-> query("SELECT name FROM test ORDER BY RAND() LIMIT 1");
  $name = $result->fetch_row()[0];
?>

<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  
  <title>A test page</title>
  <meta name="description" content="A test page">
  <meta name="author" content="Me">
</head>
<body>
  <div style="margin: 0 auto; text-align: center; width: 80%;">
    <h1>WOW! That is such a cool page, <?=$name;?>!</h1>
    <img src="ym.webp" style="width: 50%; height: 50%; alt="testimage">
  </div>
</body>
</html>