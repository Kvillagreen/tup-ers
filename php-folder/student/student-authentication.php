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
$tupvId = $data['tupvId'] ?? ''; // Input can be email or username
$password = $data['password'] ?? '';

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
        // Success response with user data and permissions
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'student' => [
                'studentId' => $user['student_id'],
                'tupvId' => $user['tupv_id'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
            ],
            'tokenId' => $user['token_id'] ?? null, // Optional field
            'program' => $user['program'],
            'dateCreated' => $user['date_created'],
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Credentials']);
}

// Close database connection
$stmt->close();
$conn->close();
