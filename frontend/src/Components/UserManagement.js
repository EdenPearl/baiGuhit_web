import Loader from './CustomizeLoader'; // Add this import
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';


const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setError('Please log in to manage users.');
          return;
        }
        const response = await axios.get(
          url_t + 'auth/user_profile',
          {
            headers: {
              'Content-Type': 'application/json',
              'session-id': sessionId,
            },
          }
        );
        if (response.data.user) {
          setAuthUser(response.data.user);
        }
      } catch (err) {
        console.error('Error fetching authenticated user:', err);
        setError(err.response?.data?.error || 'Failed to authenticate user');
      }
    };

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const response = await axios.get(
          url_t + 'auth/getall/admin',
          {
            headers: {
              'Accept': 'application/json',
              'session-id': sessionId,
            },
          }
        );

        if (!response.data || response.data.error) {
          throw new Error(response.data?.error || 'Failed to fetch users');
        }

        const users = response.data.users || [];
        setUsers(users);
        setFilteredUsers(users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthUser();
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEdit = (userId) => {
    console.log(`Edit user with ID: ${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const sessionId = localStorage.getItem('sessionId');
        await axios.delete(url_t + `auth/users/${userId}`, {
          headers: {
            'session-id': sessionId,
          },
        });
        setUsers(users.filter((user) => user.id !== userId));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (!authUser) return <Container>Please log in to manage users.</Container>;
  if (loading) return <Container><Loader /></Container>; // Use Loader component here
  if (error) return <ErrorContainer>Error: {error}</ErrorContainer>;

  return (
    <Container>
      <Header>
        <h1>User Management</h1>
        <SearchBar>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </Header>
      <SectionTitle>Users ({filteredUsers.length})</SectionTitle>
      {filteredUsers.length === 0 ? (
        <NoUsers>No users found.</NoUsers>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <ActionButton onClick={() => handleEdit(user.id)} primary>
                      <FaEdit /> Edit
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(user.id)}
                      danger
                    >
                      <FaTrash /> Delete
                    </ActionButton>
                  </td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

// Styled components remain unchanged
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(90deg, rgb(170, 39, 13), rgb(231, 145, 91));
  min-height: 100vh;
  color: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  width: 100%;

  svg {
    color: #aa270d;
    margin-right: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 1rem;
  width: 100%;
  background: transparent;
  color: #333;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  font-weight: 600;
  color: #fff;
  border-left: 4px solid #e7915b;
  padding-left: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const TableContainer = styled.div`
  max-height: 500px;
  overflow-x: auto;
  overflow-y: auto;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    min-width: 120px;
  }

  th {
    background: #aa270d;
    color: #fff;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    color: #333;
  }
`;

const TableRow = styled.tr`
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background: rgba(231, 145, 91, 0.1);
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.primary ? '#e7915b' : '#aa270d')};
  color: #fff;

  &:hover {
    background: ${(props) => (props.primary ? '#d47a48' : '#8e200b')};
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  color: #aa270d;
  border-radius: 8px;
  text-align: center;
  margin: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NoUsers = styled.p`
  text-align: center;
  color: #333;
  font-size: 1.1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export default UserManagement;