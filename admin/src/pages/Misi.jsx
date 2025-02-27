import { useState, useEffect } from "react"
import axios from 'axios'
import toast from 'react-hot-toast' 

export default function Indicator() {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({name:""})
  const [formErrors, setFormErrors] = useState({})
  const [isEditMode, setEditMode] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen:false, id:null, type:"mission" })

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get('/api/v1/admin/mission')
            if(response.data && response.data.data){
                setMissions(response.data.data)
            } else {
                setMissions([])
            }
        } catch (error) {
            console.error("Failed fetching data:", error)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  },[])

  const openDialog = (mission = null) => {
    if(mission){
        setFormData({
            id:mission._id,
            name:mission.name,
        })
        setEditMode(true)
    } else {
        setFormData({
            name:""
        })
        setEditMode(false)
    }

    setFormErrors({})
    setDialogOpen(true)
  }


  const closeDialog = () => {
    setFormData({
        name:""
    })

    setFormErrors({})
    setDialogOpen(false)
    setEditMode(false)
  }


  const validateForm = () => {
    const errors = {}

    // Cek apakah name kosong
    if (!formData.name.trim()) {
        errors.name = "All fields are required!";
    }

    // Validasi lainnya bisa ditambahkan jika ada aturan tambahan dari backend

    setFormErrors(errors)
    return Object.keys(errors).length === 0
}

  const handleSubmit = async () => {
    if(!validateForm()) return;

    try {
        if(isEditMode){
            await axios.put(`/api/v1/admin/mission/${formData.id}`, formData)
            toast.success("Berhasil mengubah data misi!")

            // Update state
            setMissions((prev) => prev.map((item) => (item._id === formData.id ? {...item, name:formData.name} : item)))
        } else {
            const response = await axios.post("/api/v1/admin/mission", formData)
            toast.success("Berhasi menambah misi!")

            setMissions((prev) => [...prev, response.data.data])
        }

        closeDialog()
    } catch (error) {
        console.error("Error changing mission", error)
        toast.error("Gagal menyimpan data misi")
    }
  }

  const confirmDelete = (missionId) => {
    setDeleteDialog({isOpen:true, missionId})
  }

  const handleDelete = async () => {
    try {
        await axios.delete(`/api/v1/admin/mission/${deleteDialog.missionId}`);

        // Hapus indikator dari state
        setMissions((prev) => prev.filter((policy) => policy._id !== deleteDialog.missionId));

        toast.success("Misi berhasil dihapus!");
        setDeleteDialog({ isOpen: false, missionId: null });
    } catch (error) {
        console.error("Failed deleting mission:", error);
        toast.error("Gagal menghapus misi");
    }
};


  if(loading) return <div>Loading...</div>
  if(error) return <div className="error-container"><p>{error}</p></div>

  return (
    <div className="container admin-container mission-container">
      <h1 className="admin-page-title">Misi</h1>
      <button onClick={() => openDialog()} className="add-btn">+</button>

      {missions.length === 0 ? (<p>Belum ada Misi</p>) : 
      (
        <ul className="mission-list admin-item-list">
            {missions.map((mission, index) => (
                <li key={index} className="mission-item admin-item">
                    <div className="mission-item admin-item">
                        <p>{mission.name}</p>
                    </div>

                    <div className="handle-item-btn">
                        <button onClick={() => openDialog(mission)} className="edit-btn">Edit</button>
                        <button onClick={() => confirmDelete(mission._id)} className="delete-btn">Delete</button>
                    </div>
                </li>
            ))}
        </ul>
      )}

      {isDialogOpen && (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <h2 className="dialog-title">{isEditMode ? "edit misi" : "menambah misi"}</h2>
                <div className="form-item">
                    <label>Nama</label>
                    <input 
                    type="text"
                    placeholder="nama misi..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name:e.target.value})}
                    className={formErrors.name ? "input-error" : ""}
                    />
                    {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                </div>

                <div className="dialog-actions">
                    <button onClick={closeDialog} className="cancel-btn">Cancel</button>
                    <button onClick={handleSubmit} className="action-btn">{isEditMode ? "Update" : "Add"}</button>
                </div>
            </div>
        </div>
      )}

      {deleteDialog.isOpen && (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <div className="form-item">
                    <p>Apakah anda yakin ingin menghapus misi ini?</p>
                </div>
                <div className="dialog-actions">
                    <button onClick={() => setDeleteDialog({isOpen:false, missionId:null})} className="cancel-btn">Batal</button>
                    <button onClick={handleDelete} className="delete-btn">Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
