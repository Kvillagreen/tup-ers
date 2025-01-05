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
$tokenId = $data['tokenId'] ?? '6778c1095500f';
$classId = $data['classId'] ?? '2';

if (empty($tokenId) || empty($classId)) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit(0);
}

// Validate admin token
$sql = "SELECT * FROM tbl_admin WHERE token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    exit(0);
}

try {
    // Fetch all petitions for the class
    $sqlQuery = "
    SELECT s.first_name,s.last_name,s.student_id,s.tupv_id,s.email, p.*
    FROM tbl_petition p
    JOIN tbl_student s ON p.student_id = s.student_id
    WHERE p.class_id = ?
";

    $stmt = $conn->prepare($sqlQuery);
    $stmt->bind_param("s", $classId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode([
            'success' => true,
            'data' => $data,
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
    $conn->close();
}
?>