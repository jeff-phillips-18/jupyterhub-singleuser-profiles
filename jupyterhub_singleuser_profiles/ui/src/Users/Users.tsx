import React from 'react';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Pagination,
} from '@patternfly/react-core';
import { TableComposable, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { timeSince } from '../utils/utils';
import { JHUser } from '../utils/types';
import { startServerForUser, stopServerForUser } from '../utils/HubCalls';

import './Users.scss';
import ConfirmationModal from '../utils/ConfirmationModal';

type UsersPropTypes = {
  users: JHUser[];
  forceUserUpdate: () => void;
};

const getUTCForActivity = (lastActivity: string | null): number => {
  console.log(`${lastActivity}: ${lastActivity ? Date.parse(lastActivity) : 0}`);
  return lastActivity ? Date.parse(lastActivity) : 0;
};

const Users: React.FC<UsersPropTypes> = ({ users, forceUserUpdate }) => {
  const [disabledUserActions, setDisabledUserActions] = React.useState<string[]>([]);
  const [alertClosed, setAlertClosed] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [perPage, setPerPage] = React.useState<number>(10);
  const [activeSort, setActiveSort] = React.useState<{ index: number; direction: 'asc' | 'desc' }>({
    index: 0,
    direction: 'desc',
  });
  const [confirmationModal, setConfirmationModal] = React.useState<{
    shown: boolean;
    title?: string;
    message?: React.ReactNode;
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({ shown: false });

  const startServer = (user: JHUser) => {
    console.log('Start: ', user);
    console.log(`Navigate to: ./spawn/${user.name}`);
    window.location.href = `./spawn/${user.name}`;
  };

  const doStopServer = (user: JHUser) => {
    setDisabledUserActions((prevActions) => [...prevActions, user.name]);
    stopServerForUser(user.name).then(() => {
      setDisabledUserActions((prevActions) => {
        const index = prevActions.indexOf(user.name);
        if (index >= 0) {
          return [...prevActions.slice(0, index), ...prevActions.slice(index + 1)];
        }
        return prevActions;
      });
      forceUserUpdate();
    });
    setConfirmationModal({ shown: false });
  };

  const stopServer = (user: JHUser) => {
    console.log('Stop: ', user);
    setConfirmationModal({
      shown: true,
      title: 'Stop server',
      message: (
        <span>
          Are you sure you want to stop the server for <b>{user.name}</b>?
        </span>
      ),
      confirmLabel: 'Stop',
      onConfirm: () => doStopServer(user),
    });
  };

  const displayedUsers = React.useMemo(() => {
    if (!users?.length) {
      return [];
    }
    return users
      .slice()
      .sort((a, b) => {
        let cmpValue;
        switch (activeSort.index) {
          case 0:
            cmpValue = b.name.localeCompare(a.name);
            break;
          case 1:
            if (b.admin) {
              cmpValue = a.admin ? 0 : 1;
            } else {
              cmpValue = -1;
            }
            break;
          case 2:
            cmpValue = getUTCForActivity(b.last_activity) - getUTCForActivity(a.last_activity);
            break;
          default:
            cmpValue = b.name.localeCompare(a.name);
        }
        if (activeSort.direction === 'desc') {
          cmpValue = cmpValue * -1;
        }
        if (cmpValue === 0) {
          cmpValue = a.name.localeCompare(b.name);
        }
        return cmpValue;
      })
      .slice((page - 1) * perPage, page * perPage);
  }, [activeSort.direction, activeSort.index, page, perPage, users]);

  return (
    <div className="jsp-admin__option-section">
      <div className="jsp-admin__option-section__title">Users</div>
      {!alertClosed ? (
        <Alert
          isInline
          title="User management is handled through OpenShift"
          actionClose={<AlertActionCloseButton onClose={() => setAlertClosed(true)} />}
        >
          Administering users cannot be done here. You should use the OpenShift console to manage
          your JupyterHub users and their access.
          <span className="jsp-admin__users__learn-more">
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              Learn more about OpenShift user management
              <ExternalLinkAltIcon />
            </a>
          </span>
        </Alert>
      ) : null}
      <div className="jsp-admin__users__table-body">
        <TableComposable aria-label="Simple table" variant="compact">
          <Thead>
            <Tr>
              <Th
                sort={{
                  sortBy: activeSort,
                  onSort: (e, index, direction) => setActiveSort({ index, direction }),
                  columnIndex: 0,
                }}
              >
                User
              </Th>
              <Th
                sort={{
                  sortBy: activeSort,
                  onSort: (e, index, direction) => setActiveSort({ index, direction }),
                  columnIndex: 1,
                }}
              >
                Privilege
              </Th>
              <Th
                sort={{
                  sortBy: activeSort,
                  onSort: (e, index, direction) => setActiveSort({ index, direction }),
                  columnIndex: 2,
                }}
              >
                Last activity
              </Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {displayedUsers.map((user) => (
              <Tr key={user.name}>
                <Td dataLabel="Username">{user.name}</Td>
                <Td dataLabel="Privilege">{user.admin ? 'Admin' : 'User'}</Td>
                <Td dataLabel="Last activity">
                  {user.last_activity ? timeSince(user.last_activity) : 'Never'}
                </Td>
                <Td dataLabel="Server">
                  {user.pending ? (
                    <span>Pending</span>
                  ) : (
                    <div className="jsp-admin__users__server-button">
                      {user.server ? (
                        <Button
                          variant={ButtonVariant.link}
                          isDanger
                          onClick={() => stopServer(user)}
                          isDisabled={disabledUserActions.includes(user.name)}
                        >
                          Stop server
                        </Button>
                      ) : (
                        <Button
                          variant={ButtonVariant.link}
                          onClick={() => startServer(user)}
                          isDisabled={disabledUserActions.includes(user.name)}
                        >
                          Start server
                        </Button>
                      )}
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </div>
      {users?.length > 10 ? (
        <Pagination
          className="jsp-admin__users__pagination"
          itemCount={users.length}
          perPage={perPage}
          page={page}
          onSetPage={(e, pageNumber) => setPage(pageNumber)}
          onPerPageSelect={(e, newPerPage) => setPerPage(newPerPage)}
          perPageOptions={[
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 },
            { title: '100', value: 100 },
          ]}
        />
      ) : null}
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

export default Users;
