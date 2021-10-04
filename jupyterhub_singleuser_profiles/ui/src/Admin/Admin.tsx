import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import { Button, ButtonVariant } from '@patternfly/react-core';
import Users from '../Users/Users';
import { shutdown, stopServerForUser } from '../utils/HubCalls';
import { useWatchUsers } from '../utils/useWatchUsers';
import ConfirmationModal from '../utils/ConfirmationModal';

import './Admin.scss';

const Admin: React.FC = () => {
  const [forceCount, setForceCount] = React.useState<number>(0);
  const userResults = useWatchUsers(forceCount);
  const [confirmationModal, setConfirmationModal] = React.useState<{
    shown: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({ shown: false });

  const doStopAll = () => {
    const stopRequests = userResults.users.map((user) => stopServerForUser(user.name));
    Promise.all(stopRequests).then(() => forceUserUpdate());
    setConfirmationModal({ shown: false });
  };

  const stopAll = () => {
    setConfirmationModal({
      shown: true,
      title: 'Stop all servers',
      message: 'Are you sure you want to stop the servers for all users?',
      confirmLabel: 'Stop',
      onConfirm: doStopAll,
    });
  };

  const doShutdownHub = () => {
    shutdown().then(() => forceUserUpdate());
    setConfirmationModal({ shown: false });
  };

  const shutdownHub = () => {
    setConfirmationModal({
      shown: true,
      title: 'Shutdown hub',
      message: 'Are you sure you want to shutdown the notebook server hub?',
      confirmLabel: 'Shutdown',
      onConfirm: doShutdownHub,
    });
  };

  const forceUserUpdate = (): void => {
    setForceCount((prevCount) => prevCount + 1);
  };

  return (
    <div className="jsp-admin">
      <div className="jsp-admin__header">
        <div className="jsp-admin__header__title-line">
          <div className="jsp-admin__header__title">Administration</div>
          <div className="jsp-admin__buttons-bar">
            <Button
              variant={ButtonVariant.secondary}
              isDanger
              onClick={() => stopAll()}
              isDisabled={!userResults?.users?.find((user) => user.server)}
            >
              Stop all servers
            </Button>
            <Button variant={ButtonVariant.secondary} isDanger onClick={() => shutdownHub()}>
              Shutdown hub
            </Button>
          </div>
        </div>
        <div className="jsp-admin__header__sub-title">Manage notebook servers.</div>
        <Users users={userResults.users} forceUserUpdate={forceUserUpdate} />
      </div>
      <ConfirmationModal
        shown={confirmationModal.shown}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
        onCancel={() => setConfirmationModal({ shown: false })}
        onConfirm={confirmationModal.onConfirm}
      />
    </div>
  );
};

export default Admin;
