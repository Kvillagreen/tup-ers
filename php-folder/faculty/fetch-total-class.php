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
$tokenId = $data['tokenId'] ?? Null;
$facultyId = $data['facultyId'] ?? Null;
if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
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
           * 
        FROM tbl_class WHERE faculty_id = ?
        ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $facultyId);
    $result = $conn->query(query: $stmt);

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