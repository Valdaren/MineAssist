<?php
include 'db_config.php';

$post_data = json_decode(file_get_contents('php://input'), true);

if (isset($post_data)) {
    $queries = [];

    // Log the received POST data
    error_log('Received POST data: ' . json_encode($post_data));

    if (isset($post_data['release']) && isset($post_data['release']['comparison']) && isset($post_data['release']['value'])) {
        $comparison = $post_data['release']['comparison'];
        $value = floatval($post_data['release']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "release_version_number $comparison $value";
            error_log("Added query for release_version_number: release_version_number $comparison $value");
        }
    }

    if (isset($post_data['stack-size']) && isset($post_data['stack-size']['comparison']) && isset($post_data['stack-size']['value'])) {
        $comparison = $post_data['stack-size']['comparison'];
        $value = floatval($post_data['stack-size']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "stack_size $comparison $value";
            error_log("Added query for stack_size: stack_size $comparison $value");
        }
    }

    if (isset($post_data['blast-resistance']) && isset($post_data['blast-resistance']['comparison']) && isset($post_data['blast-resistance']['value'])) {
        $comparison = $post_data['blast-resistance']['comparison'];
        $value = floatval($post_data['blast-resistance']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "blast_resistance $comparison $value";
            error_log("Added query for blast_resistance: blast_resistance $comparison $value");
        }
    }

    if (isset($post_data['hardness']) && isset($post_data['hardness']['comparison']) && isset($post_data['hardness']['value'])) {
        $comparison = $post_data['hardness']['comparison'];
        $value = floatval($post_data['hardness']['value']);
        if (in_array($comparison, ['>', '<', '='])) {
            $queries[] = "hardness $comparison $value";
            error_log("Added query for hardness: hardness $comparison $value");
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

    if (isset($post_data['tools']) && isset($post_data['tools']['comparison']) && isset($post_data['tools']['value'])) {
        $comparison = $post_data['tools']['comparison'];
        $value = $post_data['tools']['value'];
        $values = explode(', ', $value);
        if ($comparison === '>=') {
            $likeClause = createLikeClauses('tools', $values, $comparison);
            $queries[] = "(($likeClause) AND tools != '$value')";
        } elseif ($comparison === '=') {
            $queries[] = "tools = '$value'";
        } elseif ($comparison === '!=') {
            $notLikeClause = createLikeClauses('tools', $values, $comparison);
            $queries[] = "($notLikeClause)";
        }
        error_log("Added query for tools: tools $comparison $value");
    }

    if (isset($post_data['flammable']) && isset($post_data['flammable']['comparison']) && isset($post_data['flammable']['value'])) {
        $comparison = $post_data['flammable']['comparison'];
        $value = $post_data['flammable']['value'];
        if (in_array($comparison, ['=', '!='])) {
            $queries[] = "flammable $comparison '$value'";
            error_log("Added query for flammable: flammable $comparison '$value'");
        }
    }

    if (isset($post_data['full-block']) && isset($post_data['full-block']['comparison']) && isset($post_data['full-block']['value'])) {
        $comparison = $post_data['full-block']['comparison'];
        $value = $post_data['full-block']['value'];
        if (in_array($comparison, ['=', '!='])) {
            $queries[] = "full_block $comparison '$value'";
            error_log("Added query for full_block: full_block $comparison '$value'");
        }
    }

    // Combine all conditions with AND
    $whereClause = implode(' AND ', $queries);
    $sql = "SELECT name FROM blocks WHERE $whereClause";

    // Logging the query for debugging purposes
    error_log('SQL Query: ' . $sql);

    $result = $conn->query($sql);
    if (!$result) {
        error_log('Query Error: ' . $conn->error);
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
    error_log('Query Results: ' . json_encode($queryResults));
    echo json_encode($queryResults);
} else {
    echo json_encode(['error' => 'Invalid input data']);
}