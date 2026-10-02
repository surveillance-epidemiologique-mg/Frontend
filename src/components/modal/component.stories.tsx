import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Modal } from './component';

const meta = {
  title: 'Components/modal',
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { open: true, onClose: () => {}, title: 'Déclarer un cas', children: 'Les informations du cas apparaissent ici.' } };
