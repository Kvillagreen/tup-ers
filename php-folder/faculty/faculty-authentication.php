<?php
// login.php

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
$email = $data['email'] ?? 'kmv@tupv.edu'; // Input can be email or username
$password = $data['password'] ?? 'Villagreen23';
$tokenId = substr(bin2hex(random_bytes(45)), 0, 45);// Generate a unique token ID if not provided
$otpCode = json_encode([
    'otp' => '',
    'time' => '',
]);
// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    http_response_code(400); // Bad Request
    exit;
}

// Determine if input is email or username
$sql = "SELECT * FROM tbl_admin WHERE email = ? ";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {

        $updateSql = "UPDATE tbl_admin SET otp_code = ?, token_id = ? WHERE email = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("sss", $otpCode, $tokenId, $email);

        if ($user['status'] == 'approved' && $updateStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'faculty' => [
                    'facultyId' => $user['faculty_id'],
                    'email' => $user['email'],
                    'firstName' => $user['first_name'],
                    'lastName' => $user['last_name'],
                    'facultyType' => $user['faculty_type'],
                    'status' => $user['status'],
                ],
                'tokenId' => $tokenId, 
                'program' => $user['program'],
                'status' => $user['status'],
                'dateCreated' => $user['date_created'],
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Status not yet approved, Kindly contact registrar for assistance.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Credentials']);
}

// Close database connection
$stmt->close();
$conn->close();
