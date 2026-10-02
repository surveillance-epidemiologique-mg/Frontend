import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CentreFormModal } from './component';

const meta = {
  title: 'Components/centre-form-modal',
  component: CentreFormModal,
  tags: ['autodocs'],
} satisfies Meta<typeof CentreFormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
