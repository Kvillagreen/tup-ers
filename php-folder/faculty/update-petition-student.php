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
$tokenId = $data['tokenId'] ?? null;
$classId = $data['classId'] ?? null;
$petitionId = $data['petitionId'] ?? null;
$status = $data['status'] ?? null;
$studentId = $data['studentId'] ?? null;
$notedBy = $data['notedBy'] ?? null;
$reasons = $data['reasons'] ?? null;
$message = $data['message'] ?? null;
$messageStatus = 'unread' ;
$dateCreated = date('Y-m-d H:i:s');

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
    if ($status == 'pending') {

        $updateClassStatus = $conn->prepare(
            "UPDATE tbl_petition 
                SET status = ? 
                WHERE class_id = ? 
                AND petition_id = ? 
                AND EXISTS (
                SELECT 1 FROM tbl_class 
                WHERE tbl_class.class_id = tbl_petition.class_id 
                AND tbl_class.capacity < 50
                )"
        );
        $updateClassStatus->bind_param("sss", $status, $classId, $petitionId);

        if ($updateClassStatus->execute()) {
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


        $updateClassStatus = $conn->prepare(
            "UPDATE tbl_petition SET status = ? WHERE class_id = ? AND petition_id = ?"
        );
        $updateClassStatus->bind_param("sss", $status, $classId, $petitionId);

        $insertMessage = $conn->prepare(
            "INSERT INTO `tbl_notification` (`student_id`, `message`, `reasons`, `noted_by`, `status`, `date_created`) 
            VALUES (?,?,?,?,?,?)"
        );

        $insertMessage->bind_param("ssssss", $studentId, $message, $reasons, $notedBy, $messageStatus, $dateCreated);

        if ($updateClassStatus->execute() && $insertMessage->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Update Succesful',
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error Failed'
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