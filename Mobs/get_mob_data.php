<?php
include 'db_config.php';

if (isset($_POST['mobName'])) {
    $mobName = $_POST['mobName'];

    $stmt = $conn->prepare("SELECT release_version, health, height, behavior, spawn, classification, release_version_number FROM mobs WHERE name = ?");
    $stmt->bind_param("s", $mobName);
    $stmt->execute();
    $stmt->bind_result($release, $health, $height, $behavior, $spawn, $classification, $release_version_number);

    $mobData = [];
    if ($stmt->fetch()) {
        $mobData = [
            "release" => $release,
            "health" => $health,
            "height" => $height,
            "behavior" => $behavior,
            "spawn" => $spawn,
            "classification" => $classification,
            "release_version_number" => $release_version_number,
        ];
    }

    $stmt->close();
    $conn->close();

    echo json_encode($mobData);
}