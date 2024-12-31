
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
$lastName = $data['lastName'] ?? '';
$firstName = $data['firstName'] ?? '';
$email = $data['email'] ?? '';
$tupvId = $data['tupvId'] ?? '';
$password = $data['password'] ?? '';
$program = $data['program'] ?? '';
$tokenId =  uniqid(); // Generate a unique token ID if not provided
$dateCreated = date('Y-m-d H:i:s');
if(!$lastName || !$firstName || !$email || !$tupvId || !$password ||!$program){
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}

try {
    // Check for existing username or email
    $isIdExist = $conn->prepare("SELECT * FROM `tbl_student` WHERE `tupv_id` = ?");
    $isIdExist->bind_param("s", $tupvId);
    $isIdExist->execute();
    $isIdExist = $isIdExist->get_result();

    if ($isIdExist && $isIdExist->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'TUPV ID already exist, please login your account.'
        ]);
        exit();
    }

    // Hash the password for security
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $insertQuery = $conn->prepare(
        "INSERT INTO `tbl_student` (`first_name`, `last_name`, `email`, `tupv_id`, `password`, `program`, `token_id`, `date_created`) 
        VALUES (?,?,?,?,?,?,?,?)"
    );
    $insertQuery->bind_param("ssssssss", $firstName, $lastName, $email, $tupvId, $hashedPassword, $program, $tokenId, $dateCreated);

    if ($insertQuery->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful. You can now login your account',
            'token' => $tokenId
        ]);
    } else {
        throw new Exception('Registration failed. Please try again later.');
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
