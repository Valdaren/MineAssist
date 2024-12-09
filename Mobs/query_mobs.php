<?php
include 'db_config.php';

$post_data = json_decode(file_get_contents('php://input'), true);

if (isset($post_data)) {
    $queries = [];

    if (isset($post_data['health'])) {
        $comparison = $post_data['health']['comparison'];
        $value = floatval($post_data['health']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "health $comparison $value";
        }
    }

    if (isset($post_data['height'])) {
        $comparison = $post_data['height']['comparison'];
        $value = floatval($post_data['height']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "height $comparison $value";
        }
    }

    if (isset($post_data['release']) && isset($post_data['release']['comparison']) && isset($post_data['release']['value'])) {
        $comparison = $post_data['release']['comparison'];
        $value = floatval($post_data['release']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "release_version_number $comparison $value";
            error_log("Added query for release_version_number: release_version_number $comparison $value");
        }
    }

    function createLikeClauses($field, $values, $comparison) {
        $clauses = [];
        foreach ($values as $value) {
            if ($comparison === '!=') {
                $clauses[] = "$field NOT LIKE '%$value%'";
            } else {
                $clauses[] = "$field LIKE '%$value%'";
            }
        }
        return implode(' OR ', $clauses);
    }

    if (isset($post_data['behavior'])) {
        $comparison = $post_data['behavior']['comparison'];
        $value = $post_data['behavior']['value'];
        $values = explode(', ', $value);
        if ($comparison === '>=') {
            $likeClause = createLikeClauses('behavior', $values, $comparison);
            $queries[] = "(($likeClause) AND behavior != '$value')";
        } elseif ($comparison === '=') {
            $queries[] = "behavior = '$value'";
        } elseif ($comparison === '!=') {
            $notLikeClause = createLikeClauses('behavior', $values, $comparison);
            $queries[] = "($notLikeClause)";
        }
    }

    if (isset($post_data['spawn'])) {
        $comparison = $post_data['spawn']['comparison'];
        $value = $post_data['spawn']['value'];
        $values = explode(', ', $value);
        if ($comparison === '>=') {
            $likeClause = createLikeClauses('spawn', $values, $comparison);
            $queries[] = "(($likeClause) AND spawn != '$value')";
        } elseif ($comparison === '=') {
            $queries[] = "spawn = '$value'";
        } elseif ($comparison === '!=') {
            $notLikeClause = createLikeClauses('spawn', $values, $comparison);
            $queries[] = "($notLikeClause)";
        }
    }

    if (isset($post_data['classification'])) {
        $comparison = $post_data['classification']['comparison'];
        $value = $post_data['classification']['value'];
        $values = explode(', ', $value);
        if ($comparison === '>=') {
            $likeClause = createLikeClauses('classification', $values, $comparison);
            $queries[] = "(($likeClause) AND classification != '$value')";
        } elseif ($comparison === '=') {
            $queries[] = "classification = '$value'";
        } elseif ($comparison === '!=') {
            $notLikeClause = createLikeClauses('classification', $values, $comparison);
            $queries[] = "($notLikeClause)";
        }
    }

    $whereClause = implode(' AND ', $queries);
    $sql = "SELECT name FROM mobs WHERE $whereClause";

    $result = $conn->query($sql);
    if (!$result) {
        echo json_encode(['error' => $conn->error]);
        exit;
    }

    $queryResults = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $queryResults[] = $row['name'];
        }
    }

    $conn->close();
    echo json_encode($queryResults);
} else {
    echo json_encode(['error' => 'Invalid input data']);
}