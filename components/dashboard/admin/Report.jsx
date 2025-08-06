import { motion } from 'framer-motion';
import ProjectReport from '../../../pages/dashboard/admin/project/ProjectReport';

const Report = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProjectReport />
    </motion.div>
  );
};

export default Report;
