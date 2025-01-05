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
$classId = '2';
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
    $sql = "SELECT 
    s.first_name,
    s.last_name,
    s.student_id,
    s.tupv_id,
    s.date_created AS student_date_created,
    p.class_id AS petition_class_id,
    p.student_id AS petition_student_id,
    c.class_id AS class_id,
    c.subject_name,
    c.program,
    c.status,
    c.units,
    c.subject_code
FROM tbl_student s
INNER JOIN tbl_petition p ON s.student_id = p.student_id
INNER JOIN tbl_class c ON c.class_id = p.class_id
WHERE p.status != 'denied'
  AND c.status != 'finished'";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Data found.',
            'data' => $data
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No data found.'
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