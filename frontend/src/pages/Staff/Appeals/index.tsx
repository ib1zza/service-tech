import { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import HistoryIcon from '@mui/icons-material/History';
import NewAppealTab from "./components/NewAppealTab.tsx";
import PostedAppealsTab from "./components/PostedAppealsTab.tsx";
import AppealsInWorkTab from "./components/AppealsInWorkTab.tsx";
import HistoryAppealsTab from "./components/HistoryAppealsTab.tsx";

function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index:number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function ClientAppealsPage() {
    const [value, setValue] = useState(0);

    const handleChange = (_event: any, newValue: number) => {
        setValue(newValue);
    };

    // Функция для отображения статуса в виде чипа
    const renderStatusChip = (status: any) => {
        let color;
        switch (status) {
            case 'Новая':
                color = 'primary';
                break;
            case 'В работе':
                color = 'warning';
                break;
            case 'Завершена':
                color = 'success';
                break;
            case 'Отклонена':
                color = 'error';
                break;
            default:
                color = 'default';
        }
        return <Chip label={status} color={color as any} size="small" />;
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Панель управления заявками
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="tabs for appeals"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        label="Новые заявки"
                        icon={<AssignmentIcon />}
                        iconPosition="start"
                        {...a11yProps(1)}
                    />
                    <Tab
                        label="Заявки в работе"
                        icon={<BuildIcon />}
                        iconPosition="start"
                        {...a11yProps(2)}
                    />
                    <Tab
                        label="История заявок"
                        icon={<HistoryIcon />}
                        iconPosition="start"
                        {...a11yProps(3)}
                    />
                </Tabs>
            </Box>


            {/* Панель для размещенных заявок */}
            <TabPanel value={value} index={0}>
                <PostedAppealsTab />
            </TabPanel>

            {/* Панель для заявок в работе */}
            <TabPanel value={value} index={1}>
                <AppealsInWorkTab />
            </TabPanel>

            {/* Панель для истории заявок */}
            <TabPanel value={value} index={2}>
                <HistoryAppealsTab />
            </TabPanel>
        </Box>
    );
}
