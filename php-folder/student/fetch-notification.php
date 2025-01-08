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

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return;
}
try {
    // Validate token
    $sql = "SELECT * FROM tbl_student WHERE token_id = ? AND student_id =?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $tokenId, $studentId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows !== 1) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid Token',
        ]);
        return;
    }

    $sql = "SELECT 
        *
        FROM tbl_notification 
        WHERE student_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $notificationData = [];
        while ($row = $result->fetch_assoc()) {
            $notificationData[] = $row;
        }
        echo json_encode([
            'success' => true,
            'data' => $notificationData,
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No data found.',
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
} finally {
    // Close the database connection
    $conn->close();
}
?>