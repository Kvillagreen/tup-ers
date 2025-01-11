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
$classId = $data['classId'] ?? Null;
$status = $data['status'] ?? Null;

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
    if ($status == 'finished') {
        $updateStatus = $conn->prepare(
            "UPDATE tbl_class SET status = ? WHERE class_id = ? "
        );

        $updateStatusPetition = $conn->prepare(
            "UPDATE tbl_petition SET status = ? WHERE class_id = ? "
        );

        $updateStatusPetition->bind_param("ss", $status, $classId);
        $updateStatus->bind_param("ss", $status, $classId);
        if ($updateStatus->execute() && $updateStatusPetition->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Update Succesful',
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Capacity Full'
            ]);
        }
    } else if ($status == 'denied') {
        $updateStatus = $conn->prepare(
            "UPDATE tbl_class SET status = ? WHERE class_id = ? "
        );

        $updateStatusPetition = $conn->prepare(
            "UPDATE tbl_petition SET status = ? WHERE class_id = ? "
        );

        $updateStatusPetition->bind_param("ss", $status, $classId);
        $updateStatus->bind_param("ss", $status, $classId);
        if ($updateStatus->execute() && $updateStatusPetition->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Update Succesful',
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Capacity Full'
            ]);
        }
    } else {
        $updateStatus = $conn->prepare(
            "UPDATE tbl_class SET status = ? WHERE class_id = ? "
        );

        $updateStatus->bind_param("ss", $status, $classId);
        if ($updateStatus->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Update Succesful',
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Capacity Full'
            ]);
        }
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