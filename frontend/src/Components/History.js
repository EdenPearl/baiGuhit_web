import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationModal from './ConfirmationModal';
import Loader from './CustomizeLoader';

const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";
const History = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    const fetchData = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        console.error('No session ID found in localStorage');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        params: {
          page: page + 1,
          limit,
        },
      };

      try {
        setLoading(true);  // Show loader before fetching data
        const response = await axios.get(url_t +'images/check_image_history', config);
        setData(response.data.history);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);  // Hide loader after data is fetched
      }
    };

    fetchData();
  }, [page, limit]);

  const handlePageChange = (selectedPage) => {
    setPage(selectedPage.selected);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedIds(data.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds(prevSelectedIds => {
      if (prevSelectedIds.includes(id)) {
        return prevSelectedIds.filter(selectedId => selectedId !== id);
      } else {
        return [...prevSelectedIds, id];
      }
    });
  };

  const handleDelete = async () => {

    toast.success('History deleted successfully');

    try {
      const sessionId = localStorage.getItem('sessionId');
      setLoading(true);  // Show loader before deleting

      await axios.delete(url_t +'images/check_image_history', {
        data: { ids: selectedIds },
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
      });

      // Fetch the updated data after deletion
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'session-id': sessionId,
        },
        params: {
          page: page + 1,
          limit,
        },
      };
      const response = await axios.get(url_t +'check_image_history', config);
      setData(response.data.history);
      setTotalPages(response.data.pagination.totalPages);

      // Clear the selection
      setSelectedIds([]);
      setSelectAll(false);
     
    } catch (error) {
      console.error('Failed to delete history:', error);
      toast.error('Failed to delete history');
    } finally {
      setLoading(false);  // Hide loader after data is updated
      setIsModalOpen(false);  // Close the confirmation modal
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loader />;  
  }

  return (
    <HistoryContainer>
      <TableHeaderWrapper>
        <DeleteButton onClick={openModal}>Delete History</DeleteButton>
      </TableHeaderWrapper>
      <TableContainer>
        {data.length === 0 ? (
          <NoDataMessage>No Baybayin detected</NoDataMessage>
        ) : (
          <Table>
            <thead>
              <TableRow>
                <TableHeader>
                  <Checkbox
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </TableHeader>
                <TableHeader>Baybayin</TableHeader>
                <TableHeader>Time Detected</TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                    />
                  </TableCell>
                  <TableCell>{item.response}</TableCell>
                  <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
      {data.length > 0 && (
        <PaginationWrapper>
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            activeClassName={'active'}
          />
        </PaginationWrapper>
      )}
      <ToastContainer />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete the selected history?"
      />
    </HistoryContainer>
  );
};

export default History;
const HistoryContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #ffe7e0, #fff3f0);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

const TableHeaderWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DeleteButton = styled.button`
  padding: 10px 24px;
  background: linear-gradient(to right, #a52a2a, #e7915b);
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #8b0000;
  }
`;

const TableContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #a52a2a;
    color: white;
  }
`;

const TableRow = styled.tr`
  transition: background 0.3s ease;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableHeader = styled.th`
  padding: 16px;
  font-weight: 600;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 14px;
  color: #333;
`;

const Checkbox = styled.input`
  cursor: pointer;
  transform: scale(1.1);
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;

  .pagination {
    display: flex;
    list-style: none;
    gap: 8px;
  }

  .pagination li {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 600;
    color: #a52a2a;
    border: 1px solid #a52a2a;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .pagination li.active {
    background-color: #a52a2a;
    color: white;
  }

  .pagination li:hover:not(.active) {
    background-color: #f1d6d6;
  }

  .pagination li.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #a52a2a;
  font-weight: bold;
  margin-top: 40px;
  font-size: 18px;
`;
  