import React, { useMemo, useState } from 'react';
import { Button, Modal, Tabs, type TabItem } from '../shared';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from './profileAttributes';
import ProfileDisplayCategoriesTab from './ProfileDisplayCategoriesTab';
import ProfileDisplayAttributesTab from './ProfileDisplayAttributesTab';

type ProfileDisplayTab = 'categories' | 'attributes';

export interface ProfileDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  attributes: AttributeDescriptor[];
  config: ProfileDisplayConfig;
  onChange: (patch: Partial<ProfileDisplayConfig>) => void;
  onReset: () => void;
  ruleReads?: Record<string, string[]>;
}

const ProfileDisplayModal: React.FC<ProfileDisplayModalProps> = ({
  isOpen,
  onClose,
  attributes,
  config,
  onChange,
  onReset,
  ruleReads,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileDisplayTab>('categories');

  const tabs = useMemo<TabItem[]>(
    () => [
      { key: 'categories', label: 'Categories', count: config.categories.length },
      { key: 'attributes', label: 'Attributes', count: attributes.length },
    ],
    [config.categories.length, attributes.length],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure profile display"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onReset}>
            Reset to default
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          tabs={tabs}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ProfileDisplayTab)}
          ariaLabel="Profile display settings"
        />

        <div
          role="tabpanel"
          aria-label="Categories"
          hidden={activeTab !== 'categories'}
          className={activeTab === 'categories' ? '' : 'hidden'}
        >
          <ProfileDisplayCategoriesTab
            attributes={attributes}
            config={config}
            onChange={onChange}
          />
        </div>

        <div
          role="tabpanel"
          aria-label="Attributes"
          hidden={activeTab !== 'attributes'}
          className={activeTab === 'attributes' ? '' : 'hidden'}
        >
          <ProfileDisplayAttributesTab
            attributes={attributes}
            config={config}
            onChange={onChange}
            ruleReads={ruleReads}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ProfileDisplayModal;
