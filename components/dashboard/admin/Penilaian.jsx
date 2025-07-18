import { motion } from 'framer-motion';
import ProjectRating from '../../../pages/dashboard/admin/project/ProjectRating';

const Penilaian = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ProjectRating />
    </motion.div>
  );
};

export default Penilaian;
