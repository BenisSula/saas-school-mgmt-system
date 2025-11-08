import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TeacherAttendancePage } from '../pages/TeacherAttendancePage';
import { StudentAttendancePage } from '../pages/StudentAttendancePage';

describe('Attendance pages', () => {
  it('renders teacher attendance table', () => {
    render(<TeacherAttendancePage />);
    expect(screen.getByText(/Attendance Marking/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders student attendance summary', () => {
    render(<StudentAttendancePage />);
    expect(screen.getByText(/Your attendance/i)).toBeInTheDocument();
    expect(screen.getByText(/Attendance %/i)).toBeInTheDocument();
  });
});
