<?php
include 'db_config.php';

$sql = "SELECT name FROM blocks";
$result = $conn->query($sql);

$blockNames = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $blockNames[] = $row['name'];
    }
}

$conn->close();
echo json_encode($blockNames);