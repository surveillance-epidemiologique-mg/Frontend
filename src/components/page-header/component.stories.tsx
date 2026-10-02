import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PageHeader } from './component';

const meta = {
  title: 'Components/page-header',
  component: PageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'Surveillance des cas', description: 'Suivez les signalements et leur évolution.' } };
