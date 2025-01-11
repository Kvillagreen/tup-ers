<?php

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
$studentId = $data['studentId'] ?? Null;
$notificationId = $data['notificationId'] ?? Null;
$status = $data['status'] ?? Null;

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
    return 0;
}

$sql = "SELECT * FROM tbl_student WHERE token_id = ?";
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
    $updateMessage = $conn->prepare(
        "UPDATE tbl_notification 
                SET status = ? 
                WHERE 
                 student_id = ?  AND notification_id = ?"
    );
    $updateMessage->bind_param("sss", $status, $studentId, $notificationId);
    if ($updateMessage->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Update Succesful',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Update Unsuccesful'
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