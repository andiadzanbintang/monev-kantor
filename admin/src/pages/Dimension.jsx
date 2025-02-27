import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Dimension() {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isEditMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/v1/admin/dimension");
        setDimensions(response.data.data || []);
      } catch (error) {
        console.error("Failed fetching data:", error);
        setError("Error fetching dimensions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDialog = (dimension = null) => {
    if (dimension) {
      setFormData({
        id: dimension._id,
        name: dimension.name,
        kode:dimension.kode ? dimension.kode : ''
      });
      setEditMode(true);
    } else {
      setFormData({ name: "" });
      setEditMode(false);
    }

    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setFormData({ name: "", kode:"" });
    setFormErrors({});
    setDialogOpen(false);
    setEditMode(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Nama dimensi tidak boleh kosong!";
    }

    if(!formData.kode.trim()){
      errors.kode = "Kode tidak boleh kosong"
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        await axios.put(`/api/v1/admin/dimension/${formData.id}`, formData);
        toast.success("Berhasil mengubah dimensi!");
        setDimensions((prev) =>
          prev.map((item) => (item._id === formData.id ? { ...item, name: formData.name, kode:formData.kode } : item))
        );
      } else {
        const response = await axios.post("/api/v1/admin/dimension", formData);
        toast.success("Berhasil menambahkan dimensi!");
        setDimensions((prev) => [...prev, response.data.data]);
      }

      closeDialog();
    } catch (error) {
      console.error("Error changing dimension", error);
      toast.error("Gagal menyimpan data dimensi");
    }
  };

  const confirmDelete = (dimensionId) => {
    setDeleteDialog({ isOpen: true, id: dimensionId });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/v1/admin/dimension/${deleteDialog.id}`);
      setDimensions((prev) => prev.filter((dimension) => dimension._id !== deleteDialog.id));
      toast.success("Dimensi berhasil dihapus!");
      setDeleteDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error("Failed deleting dimension:", error);
      toast.error("Gagal menghapus dimensi");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;

  return (
    <div className="container admin-container dimension-container">
      <h1 className="admin-page-title">Dimensi</h1>
      <button onClick={() => openDialog()} className="add-btn">+</button>

      {dimensions.length === 0 ? (
        <p>Belum ada dimensi</p>
      ) : (
        <ul className="dimension-list admin-item-list">
          {dimensions.map((dimension, index) => (
            <li key={index} className="dimension-item admin-item">
                <div className="dimension-item admin-item">
                    <p><span>{index + 1}.</span>{" "}{dimension.name}</p><br/>
                    <p>Kode : {dimension.kode ? dimension.kode : "belum ada kode"}</p>
                </div>

                <div className="handle-item-btn">
                    <button onClick={() => openDialog(dimension)} className="edit-btn">Edit</button>
                    <button onClick={() => confirmDelete(dimension._id)} className="delete-btn">Delete</button>
                </div>
            </li>
          ))}
        </ul>
      )}

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h2>{isEditMode ? "Edit Dimensi" : "Tambah Dimensi"}</h2>
            <div className="form-item">
              <label>Nama Dimensi</label>
              <input
                type="text"
                placeholder="Nama dimensi..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "input-error" : ""}
              />
              {formErrors.name && <p className="error-text">{formErrors.name}</p>}
            </div>
            <div className="form-item">
              <label>Kode Dimensi</label>
              <input
                type="text"
                placeholder="Kode dimensi..."
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                className={formErrors.kode ? "input-error" : ""}
              />
              {formErrors.kode && <p className="error-text">{formErrors.kode}</p>}
            </div>

            <div className="dialog-actions">
              <button onClick={closeDialog} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSubmit} className="action-btn">
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteDialog.isOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="form-item">
              <p>Apakah Anda yakin ingin menghapus dimensi ini?</p>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setDeleteDialog({ isOpen: false, id: null })} className="cancel-btn">
                Batal
              </button>
              <button onClick={handleDelete} className="delete-btn">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
