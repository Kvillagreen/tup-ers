<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Handle preflight request
}
require_once 'libs/fpdf.php';
include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tokenId = $data['tokenId'] ?? 'asdsad';
$petitionId = $data['petitionId'] ?? '2';

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return;
}

// Fetch the transaction data based on form_id
$query = "
    SELECT 
        s.first_name, 
        s.last_name, 
        s.tupv_id, 
        s.email, 
        p.class_id,
        p.student_id,
        c.subject_code, 
        c.subject_name, 
        c.program, 
        c.units
    FROM 
        tbl_petition p
    JOIN 
        tbl_class c ON p.class_id = c.class_id
    JOIN 
        tbl_student s ON p.student_id = s.student_id 
    WHERE 
        p.petition_id =?";

$stmt = $conn->prepare($query);
$stmt->bind_param("s", $petitionId);
$stmt->execute();
$result = $stmt->get_result();

$row = $result->fetch_assoc();

$fullName = $row['first_name'] . ' ' . $row['last_name'];
$tupvId = $row['tupv_id'];
$program = $row['program'];
$email = $row['email'];
$subjectCode = $row['subject_code'];
$subjectName = $row['subject_name'];
$subjectUnits = $row['units'];
$dateNow = date("F j, Y");
$title = 'Petition for Summer Class';
$note = 'Noted: ';
$verified = "Verified:";
$approved = "Approved:";



$query = "
    SELECT 
        first_name, 
        last_name, 
        faculty_type, 
        program
    FROM 
        tbl_admin WHERE program=? AND faculty_type = 'Program Head'
    ";

$stmtClass = $conn->prepare($query);
$stmtClass->bind_param("s", $program);
$stmtClass->execute();
$resultClass = $stmtClass->get_result();

$admin = $resultClass->fetch_assoc();
$adminFullName = $admin['first_name'] . ' ' . $admin['last_name'];

// Get page size from query string or use default (A4)
$page_size = isset($_GET['page_size']) ? strtoupper($_GET['page_size']) : 'A4';

// Ensure page size is valid, else default to A4
$valid_page_sizes = ['A3', 'A4', 'A5', 'LETTER', 'LEGAL'];
if (!in_array($page_size, $valid_page_sizes)) {
    $page_size = 'A4';
}

class PDF extends FPDF
{
    // Page header
    function Header()
    {
        // Logo
        $this->Image('assets/header.png', 0, 0, 190);
        // Line break
        $this->Ln(10);
    }
    // Page footer
    function Footer()
    {
        // Position at 1.5 cm from bottom
        $this->SetY(-15);
        // Line break
        $this->Ln(10);
    }
}

$pdf = new PDF('P', 'mm', $page_size);
$pdf->AddPage();

// Title
$pdf->SetFont('Arial', 'B', 20);
$pdf->Cell(180, 75, $title, 0, 1, 'C');

$pdf->SetFont('Arial', '', 12);
$pdf->MultiCell(0, 10, "Dear ".$adminFullName.",\n\nI am writing to formally request the offering of " . $subjectCode . " - " . $subjectName . " during the upcoming summer term. As a " . $program . " student, this course is essential for fulfilling my academic requirements and staying on track with my graduation timeline.\n\nI am willing to comply with any requirements necessary for this petition to be approved. I hope for your kind consideration of this request.\n\nThank you for your time and attention to this matter. I look forward to your favorable response.\n\nSincerely,\n" . $fullName . "\n" . $tupvId . "\n" . $email);

// Signature Section
$pdf->Ln(10);
$pdf->Cell(130, 5, '', 0, 0);
$pdf->Cell(59, 5, $fullName, 0, 1, 'C');
// Line
$pdf->Cell(130, 1, '', 0, 0);
$pdf->Cell(59, 1, '___________________________', 0, 1, 'C');

// Footer Section
$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(130, 5, '', 0, 0);
$pdf->Cell(59, 10, 'Name & Signature of Client', 0, 1, 'C');

// Output the PDF
$pdf->Output();
?>