<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../connection.php'; // Include your database connection

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tupvId = $data['tupvId'] ?? Null; // Input can be email or usernames
$password = $data['password'] ?? Null;
$tokenId = substr(bin2hex(random_bytes(45)), 0, 45);
$sessionId = substr(bin2hex(random_bytes(45)), 0, 45);  // Generate a unique token ID if not provided
$otpCode = json_encode([
    'otp' => '',
    'time' => '',
]);
// Validate input

if (empty($tupvId) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    http_response_code(400); // Bad Request
    exit;
}

// Determine if input is email or username
$sql = "SELECT * FROM tbl_student WHERE tupv_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tupvId);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {

        $updateSql = "UPDATE tbl_student SET otp_code = ?, token_id = ? WHERE tupv_id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("sss", $otpCode, $tokenId, $tupvId);


        if ($updateStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'student' => [
                    'studentId' => $user['student_id'],
                    'tupvId' => $user['tupv_id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'tokenId' => $tokenId,
                    'program' => $user['program'],
                    'status' => $user['status'],
                    'dateCreated' => $user['date_created'],
                    'userType' => 'student',
                    'isLoggedIn' => true,
                ],
                'sessionId' => $sessionId,
                'tokenId' => $tokenId,
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error found']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid Credentials']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Credentials']);
}

// Close database connection
$stmt->close();
$conn->close();
