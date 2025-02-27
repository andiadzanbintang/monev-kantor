import { useState, useEffect } from "react"
import axios from 'axios'
import toast from 'react-hot-toast' 

export default function Indicator() {
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({name:""})
  const [formErrors, setFormErrors] = useState({})
  const [isEditMode, setEditMode] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen:false, id:null, type:"indicator" })

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get('/api/v1/admin/indicator')
            if(response.data && response.data.data){
                setIndicators(response.data.data)
            } else {
                setIndicators([])
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

  const openDialog = (indicator = null) => {
    if(indicator){
        setFormData({
            id:indicator._id,
            name:indicator.name,
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
            await axios.put(`/api/v1/admin/indicator/${formData.id}`, formData)
            toast.success("Berhasil mengubah data indikator!")

            // Update state
            setIndicators((prev) => prev.map((item) => (item._id === formData.id ? {...item, name:formData.name} : item)))
        } else {
            const response = await axios.post("/api/v1/admin/indicator", formData)
            toast.success("Berhasi menambah indikator")

            setIndicators((prev) => [...prev, response.data.data])
        }

        closeDialog()
    } catch (error) {
        console.error("Error changing indicator", error)
        toast.error("Gagal menyimpan data indikator")
    }
  }

  const confirmDelete = (indicatorId) => {
    setDeleteDialog({isOpen:true, indicatorId})
  }

  const handleDelete = async () => {
    try {
        await axios.delete(`/api/v1/admin/indicator/${deleteDialog.indicatorId}`);

        // Hapus indikator dari state
        setIndicators((prev) => prev.filter((indicator) => indicator._id !== deleteDialog.indicatorId));

        toast.success("Indikator berhasil dihapus!");
        setDeleteDialog({ isOpen: false, indicatorId: null });
    } catch (error) {
        console.error("Failed deleting indicator:", error);
        toast.error("Gagal menghapus indikator");
    }
};


  if(loading) return <div>Loading...</div>
  if(error) return <div className="error-container"><p>{error}</p></div>

  return (
    <div className="container admin-container indicator-container">
      <h1 className="admin-page-title">Indikator</h1>
      <button onClick={() => openDialog()} className="add-btn">+</button>

      {indicators.length === 0 ? (<p>Belum ada indikator</p>) : 
      (
        <ul className="indicator-list admin-item-list">
            {indicators.map((indicator, index) => (
                <li key={index} className="indicator-item admin-item">
                    <div className="indicator-item admin-item">
                        <p><span>{index+1}.</span>{" "}{indicator.name}</p>
                    </div>

                    <div className="handle-item-btn">
                        <button onClick={() => openDialog(indicator)} className="edit-btn">Edit</button>
                        <button onClick={() => confirmDelete(indicator._id)} className="delete-btn">Delete</button>
                    </div>
                </li>
            ))}
        </ul>
      )}

      {isDialogOpen && (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <h2 className="dialog-title">{isEditMode ? "edit indikator" : "menambah indikator"}</h2>
                <div className="form-item">
                    <label>Nama</label>
                    <input 
                    type="text"
                    placeholder="nama indikator..."
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
                    <p>Apakah anda yakin ingin menghapus indikator ini?</p>
                </div>
                <div className="dialog-actions">
                    <button onClick={() => setDeleteDialog({isOpen:false, indicatorId:null})} className="cancel-btn">Batal</button>
                    <button onClick={handleDelete} className="delete-btn">Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
