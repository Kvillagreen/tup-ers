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
$tokenId = $data['tokenId'] ?? null;
$facultyId = $data['facultyId'] ?? null;

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return;
}
try {
    // Validate token
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
        return;
    }

    // Fetch petition data
    $sql = "SELECT 
            schedule,
            class_id,
            subject_name,
            units,
            status,
            program,
            subject_code
        FROM tbl_class 
        WHERE faculty_id = ? AND status='approved'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $facultyId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $petitionData = [];
        $petitionTracker = [];

        while ($row = $result->fetch_assoc()) {
            // Store petition data excluding petition_tracker
            $petitionData[] = [
                'class_id' => $row['class_id'],
                'subject_name' => $row['subject_name'],
                'subject_code' => $row['subject_code'],
                'schedule' => json_decode($row['schedule']),
                'units' => $row['units'],
                'status' => $row['status'],
                'program' => $row['program'],
            ];


        }

        // Send the response with separate petition data and petition tracker
        echo json_encode([
            'success' => true,
            'data' => $petitionData,
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