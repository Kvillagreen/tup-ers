<?php
// registration.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Handle preflight request
}

include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tokenId = $data['tokenId'] ?? '6778c1095500f';
$classId = '';
if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return 0;
}

$sql = "SELECT * FROM tbl_admin WHERE token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    return 0;
}

try {
    // Fetch all classes and check the number of petitions
    $sql = "SELECT 
            c.class_id,
            c.subject_code,
            c.subject_name,
            c.status,
            c.units,
            c.program,
            c.date_created,
            c.capacity,
            (SELECT COUNT(*) FROM tbl_petition p WHERE p.class_id = c.class_id AND p.status !='denied') AS petition_count
        FROM tbl_class c
        ";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['petition_count']) {
                // Update the class status to 'full'
                $updateClassStatus = $conn->prepare(
                    "UPDATE tbl_class SET capacity = ? WHERE class_id = ?"
                );
                $updateClassStatus->bind_param("ss", $row['petition_count'], $row['class_id']);
                $updateClassStatus->execute();
            }
            $data[] = $row;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Data found.',
            'data' => $data
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No data found.'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close the database connection
    $conn->close();
}
?>