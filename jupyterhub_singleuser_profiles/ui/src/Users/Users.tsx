import React from 'react';
import moment from 'moment';
import '@patternfly/patternfly/patternfly.min.css';
import '@patternfly/patternfly/patternfly-addons.css';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  ButtonVariant,
  Pagination,
  Spinner,
} from '@patternfly/react-core';
import { TableComposable, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { PRODUCT_NAME, USER_MANAGEMENT_URL } from '../utils/const';
import { JHUser, UsersResults } from '../utils/types';
import { stopServerForUser } from '../utils/HubCalls';
import ConfirmationModal from '../utils/ConfirmationModal';

import './Users.scss';

type UsersPropTypes = {
  userResults: UsersResults;
  forceUserUpdate: () => void;
  stopping: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageRef: any;
};

const getUTCForActivity = (lastActivity: string | null): number => {
  return lastActivity ? Date.parse(lastActivity) : 0;
};

const timeSince = (time: string | null): string => {
  if (!time) {
    return 'Never';
  }
  const date = Date.parse(time);
  const m = moment(date);
  return m.isValid() ? m.fromNow() : 'Never';
};

const Users: React.FC<UsersPropTypes> = ({ userResults, forceUserUpdate, pageRef, stopping }) => {
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
    if (!userResults.users?.length) {
      return [];
    }
    return userResults.users
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
  }, [activeSort.direction, activeSort.index, page, perPage, userResults.users]);

  const pendingMessage = (pending: string): string => {
    switch (pending) {
      case 'spawn':
        return 'Server starting...';
      case 'stop':
        return 'Server stopping...';
      default:
        return `Pending ${pending}`;
    }
  };

  const renderUsers = () => {
    if (userResults.error) {
      return (
        <Alert variant="danger" isInline title="Error loading users">
          <p>{userResults.error}</p>
        </Alert>
      );
    }
    if (!userResults.loaded) {
      return (
        <div className="jsp-admin__users__loading">
          <Spinner size="lg" />
          Loading users
        </div>
      );
    }

    return (
      <>
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
                  <Td dataLabel="Last activity">{timeSince(user.last_activity)}</Td>
                  <Td dataLabel="Server">
                    <div className="jsp-admin__users__server-button">
                      {user.pending ? (
                        <span>{pendingMessage(user.pending)}</span>
                      ) : (
                        <>
                          {user.server ? (
                            <Button
                              variant={ButtonVariant.link}
                              isDanger
                              onClick={() => stopServer(user)}
                              isDisabled={stopping || disabledUserActions.includes(user.name)}
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
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableComposable>
        </div>
        {userResults.users?.length > 10 ? (
          <Pagination
            className="jsp-admin__users__pagination"
            itemCount={userResults.users.length}
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
      </>
    );
  };

  return (
    <div className="jsp-admin__option-section jsp-admin__users">
      <div className="jsp-admin__option-section__title">Users</div>
      {!alertClosed ? (
        <Alert
          isInline
          title="User management is handled through OpenShift"
          actionClose={<AlertActionCloseButton onClose={() => setAlertClosed(true)} />}
        >
          Use the OpenShift web console to create, delete, and manage permissions for {PRODUCT_NAME}{' '}
          users.
          {USER_MANAGEMENT_URL && (
            <span className="jsp-admin__users__learn-more">
              <a href={USER_MANAGEMENT_URL} target="_blank" rel="noopener noreferrer">
                Learn more about OpenShift user management
                <ExternalLinkAltIcon />
              </a>
            </span>
          )}
        </Alert>
      ) : null}
      {renderUsers()}
      <ConfirmationModal
        shown={confirmationModal.shown}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmLabel={confirmationModal.confirmLabel}
        onCancel={() => setConfirmationModal({ shown: false })}
        onConfirm={confirmationModal.onConfirm}
        pageRef={pageRef}
      />
    </div>
  );
};

export default Users;
