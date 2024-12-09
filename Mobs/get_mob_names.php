<?php
include 'db_config.php';

$sql = "SELECT name FROM mobs";
$result = $conn->query($sql);

$mobNames = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $mobNames[] = $row['name'];
    }
}

$conn->close();
echo json_encode($mobNames);