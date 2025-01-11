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
$classId = $data['classId'] ?? null;
$tokenId = $data['tokenId'] ?? null;

if (!$tokenId && !$classId) {
    include '../fields-required.html';
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
    return 0;
}

try {
    $updateClassQuery = $conn->prepare(
        "UPDATE `tbl_class` SET  `status` = 'approved' WHERE `class_id` = ?"
    );
    $updatePetitionQuery = $conn->prepare(
        "UPDATE `tbl_petition` SET  `status` = 'approved' WHERE `class_id` = ? AND `status` = 'pending'"
    );
    $updateClassQuery->bind_param("s", $classId);
    $updatePetitionQuery->bind_param("s", $classId);
    if ($updateClassQuery->execute() && $updatePetitionQuery->execute() ) {
        echo json_encode([
            'success' => true,
            'message' => 'Petition approved',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Petition error approval',
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