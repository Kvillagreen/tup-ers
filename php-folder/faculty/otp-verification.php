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
$email = $data['email'] ?? Null; // Input can be email or username

// Validate input
if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    http_response_code(400); // Bad Request
    exit;
}

// Determine if input is email or username
$sql = "SELECT * FROM tbl_admin WHERE email = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $otpData = json_decode($user['otp_code'], true); // Decode JSON string to associative array

    echo json_encode([
        'success' => true,
        'otp' => $otpData['otp'], // Include `otp` directly
        'time' => $otpData['time'], // Include `otp` directly
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Credentials']);
}


// Close database connection
$stmt->close();
$conn->close();
