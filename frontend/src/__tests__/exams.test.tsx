import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TeacherGradeEntryPage from '../pages/TeacherGradeEntryPage';
import StudentResultsPage from '../pages/StudentResultsPage';
import AdminExamConfigPage from '../pages/AdminExamConfigPage';

describe('Exam pages', () => {
  it('renders teacher grade entry interface', () => {
    render(<TeacherGradeEntryPage />);
    expect(screen.getByText(/Grade Entry/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Grades/i })).toBeInTheDocument();
  });

  it('renders student results summary', () => {
    render(<StudentResultsPage />);
    expect(screen.getByText(/My Exam Results/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Score/i)).toBeInTheDocument();
  });

  it('renders admin configuration tools', () => {
    render(<AdminExamConfigPage />);
    expect(screen.getByText(/Examination Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming Exams/i)).toBeInTheDocument();
  });
});

