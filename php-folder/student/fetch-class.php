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

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return;
}

$sql = "SELECT student_id FROM tbl_student WHERE token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows != 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    return;
}

$student = $result->fetch_assoc();
$studentId = $student['student_id'];

try {

    $sql = "SELECT 
            c.class_id,
            c.subject_code,
            c.subject_name,
            c.status,
            c.units,
            c.program,
            c.date_created,
            c.capacity,
            (SELECT COUNT(*) FROM tbl_petition p WHERE p.class_id = c.class_id AND p.status!='denied') AS petition_count,
            EXISTS(
                SELECT 1 FROM tbl_petition p WHERE p.class_id = c.class_id AND p.student_id = ?
            ) AS already_applied
        FROM tbl_class c
        ";


    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = [];
        while ($row = $result->fetch_assoc()) {
            // Check if the number of petitions exceeds the capacity
            $updateClassStatus = $conn->prepare(
                "UPDATE tbl_class SET capacity = ? WHERE class_id = ? "
            );
            $updateClassStatus->bind_param("ss", $row['petition_count'], $row['class_id']);
            $updateClassStatus->execute();
            $data[] = $row;
        }
        echo json_encode([
            'success' => true,
            'message' => 'Data fetched successfully.',
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
    // Close the database connection
    $conn->close();
}
?>