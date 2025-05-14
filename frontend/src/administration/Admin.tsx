import { useChatStore } from '@/store/useChatStore';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    leads: { data: allLeads, pagination },
    getLeads
  } = useChatStore();

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
        if (
          scrollHeight - scrollTop <= clientHeight + 50 &&
          pagination?.hasNextPage
        ) {
          getLeads(pagination.currentPage + 1);
        }
      }
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScroll);
      return () => tableElement.removeEventListener('scroll', handleScroll);
    }
  }, [pagination?.hasNextPage]);

  const { initializeSocket } = useChatStore();
  useEffect(() => {
    initializeSocket();
    getLeads(1);
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, color: theme.palette.text.primary }}
      >
        Leads Management
      </Typography>
      <Typography
        variant="h6"
        sx={{ mb: 3, color: theme.palette.text.primary }}
      >
        In a real world app, this page would be protected and require
        authentication and authorization to access
      </Typography>
      <TableContainer
        component={Paper}
        ref={tableRef}
        sx={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Relevance Score</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allLeads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>{lead.sessionId}</TableCell>
                <TableCell>{lead.email || 'undetermined'}</TableCell>
                <TableCell>{lead.companyName || 'undetermined'}</TableCell>
                <TableCell>{lead.relevanceTag || 'undetermined'}</TableCell>
                <TableCell>
                  {new Date(lead.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(lead.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/?sessionId=${lead.sessionId}`)}
                  >
                    View Chat History
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Admin;
