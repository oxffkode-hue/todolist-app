import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

const defaultProps = {
  isOpen: true,
  title: '테스트 제목',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('Modal', () => {
  it('제목과 내용을 렌더링한다', () => {
    render(
      <Modal {...defaultProps}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.getByText('테스트 제목')).toBeTruthy();
    expect(screen.getByText('모달 내용')).toBeTruthy();
  });

  it('onConfirm 버튼 클릭 시 콜백을 호출한다', async () => {
    const onConfirm = vi.fn();
    render(<Modal {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText('확인'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('onCancel 버튼 클릭 시 콜백을 호출한다', async () => {
    const onCancel = vi.fn();
    render(<Modal {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('isOpen=false 시 렌더링하지 않는다', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('테스트 제목')).toBeNull();
  });
});
