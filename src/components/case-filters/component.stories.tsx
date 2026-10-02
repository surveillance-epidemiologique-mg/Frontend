import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CaseFilters } from './component';

const meta = {
  title: 'Components/case-filters',
  component: CaseFilters,
  tags: ['autodocs'],
} satisfies Meta<typeof CaseFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };
