<?php
include 'db_config.php';

if (isset($_POST['blockName'])) {
    $blockName = $_POST['blockName'];

    $stmt = $conn->prepare("SELECT release_version, stack_size, tools, blast_resistance, hardness, flammable, full_block, release_version_number FROM blocks WHERE name = ?");
    $stmt->bind_param("s", $blockName);
    $stmt->execute();
    $stmt->bind_result($release, $stackSize, $tools, $blastResistance, $hardness, $flammable, $fullBlock, $releaseVersionNumber);

    $blockData = [];
    if ($stmt->fetch()) {
        $blockData = [
            "release" => $release,
            "stack_size" => $stackSize,
            "tools" => $tools,
            "blast_resistance" => $blastResistance,
            "hardness" => $hardness,
            "flammable" => $flammable,
            "full_block" => $fullBlock,
            "release_version_number" => $releaseVersionNumber,
        ];
    }

    $stmt->close();
    $conn->close();

    echo json_encode($blockData);
}