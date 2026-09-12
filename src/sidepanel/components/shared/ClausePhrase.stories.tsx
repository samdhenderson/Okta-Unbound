import type { Meta, StoryObj } from '@storybook/react-vite';
import ClausePhrase from './ClausePhrase';

const meta = {
  title: 'Shared/ClausePhrase',
  component: ClausePhrase,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One rule clause stated as a sentence, composed from the `LeafPredicate` the explainer derived for it — `String.toLowerCase(user.department) == "sales"` reads as **department** (lowercased) equals `"sales"`.\n\n' +
          "The wording lives here; the decision lives in the type. Every form, operator and transform below comes from a closed set recognised syntactically off the clause's own AST, so nothing branches on a display string and a clause the explainer could not read exactly carries no predicate at all — at which point `ClauseLedgerClause` prints its verbatim text instead.\n\n" +
          'The `user.` prefix is dropped because the subject of every sentence is the user; the evidence line under the clause still prints the full path.',
      },
    },
  },
  argTypes: {
    predicate: { description: 'The structured description to state in words.' },
    className: { description: 'Layout classes only — the type treatment is the component’s.' },
  },
} satisfies Meta<typeof ClausePhrase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user.department', transforms: [] },
      operator: 'eq',
      operand: 'Engineering',
    },
  },
};

export const TransformedSubject: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user.department', transforms: ['toLowerCase'] },
      operator: 'eq',
      operand: 'sales',
    },
  },
};

export const NestedTransforms: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user["cost center"]', transforms: ['removeSpaces', 'toLowerCase'] },
      operator: 'ne',
      operand: 'cc-9',
    },
  },
};

export const LengthForm: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user.employeeNumber', transforms: ['len'] },
      operator: 'gte',
      operand: 6,
    },
  },
};

export const CountForm: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user.certifications', transforms: ['size'] },
      operator: 'gt',
      operand: 1,
    },
  },
};

export const NegatedContains: Story = {
  args: {
    predicate: {
      form: 'contains',
      subject: { path: 'user.login', transforms: [] },
      operand: '_vendor',
      negated: true,
    },
  },
};

export const ArrayContains: Story = {
  args: {
    predicate: {
      form: 'array-contains',
      subject: { path: 'user.certifications', transforms: [] },
      operand: 'CISSP',
      negated: false,
    },
  },
};

export const NotEmpty: Story = {
  args: {
    predicate: {
      form: 'empty',
      subject: { path: 'user.certifications', transforms: [] },
      negated: true,
    },
  },
};

export const BooleanAttribute: Story = {
  args: {
    predicate: {
      form: 'boolean-attribute',
      subject: { path: 'user.isContractor', transforms: [] },
      negated: true,
    },
  },
};

export const TwoSubjects: Story = {
  args: {
    predicate: {
      form: 'compare-subjects',
      left: { path: 'user.department', transforms: [] },
      operator: 'eq',
      right: { path: 'user.division', transforms: [] },
    },
  },
};

export const NullOperand: Story = {
  args: {
    predicate: {
      form: 'compare',
      subject: { path: 'user.projectCode', transforms: [] },
      operator: 'eq',
      operand: null,
    },
  },
};
