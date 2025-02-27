import { useState, useEffect } from "react"
import axios from 'axios'
import toast from 'react-hot-toast' 

export default function Indicator() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({name:"", kode:""})
  const [formErrors, setFormErrors] = useState({})
  const [isEditMode, setEditMode] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen:false, id:null, type:"policy" })

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get('/api/v1/admin/policy')
            if(response.data && response.data.data){
                setPolicies(response.data.data)
            } else {
                setPolicies([])
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

  const openDialog = (policy = null) => {
    if(policy){
        setFormData({
            id:policy._id,
            name:policy.name,
            kode:policy.kode ? policy.kode : ""
        })
        setEditMode(true)
    } else {
        setFormData({
            name:"",
            kode:""
        })
        setEditMode(false)
    }

    setFormErrors({})
    setDialogOpen(true)
  }


  const closeDialog = () => {
    setFormData({
        name:"",
        kode:""
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

    if(!formData.kode.trim()){
        errors.kode = "All fields are required"
    }

    // Validasi lainnya bisa ditambahkan jika ada aturan tambahan dari backend

    setFormErrors(errors)
    return Object.keys(errors).length === 0
}

  const handleSubmit = async () => {
    if(!validateForm()) return;

    try {
        if(isEditMode){
            await axios.put(`/api/v1/admin/policy/${formData.id}`, formData)
            toast.success("Berhasil mengubah data kebijakan!")

            // Update state
            setPolicies((prev) => prev.map((item) => (item._id === formData.id ? {...item, name:formData.name, kode:formData.kode} : item)))
        } else {
            const response = await axios.post("/api/v1/admin/policy", formData)
            toast.success("Berhasi menambah kebijakan!")

            setPolicies((prev) => [...prev, response.data.data])
        }

        closeDialog()
    } catch (error) {
        console.error("Error changing policy", error)
        toast.error("Gagal menyimpan data kebijakan")
    }
  }

  const confirmDelete = (policyId) => {
    setDeleteDialog({isOpen:true, policyId})
  }

  const handleDelete = async () => {
    try {
        await axios.delete(`/api/v1/admin/policy/${deleteDialog.policyId}`);

        // Hapus indikator dari state
        setPolicies((prev) => prev.filter((policy) => policy._id !== deleteDialog.policyId));

        toast.success("Kebijakan berhasil dihapus!");
        setDeleteDialog({ isOpen: false, policyId: null });
    } catch (error) {
        console.error("Failed deleting policy:", error);
        toast.error("Gagal menghapus kebijakan");
    }
};


  if(loading) return <div>Loading...</div>
  if(error) return <div className="error-container"><p>{error}</p></div>

  return (
    <div className="container admin-container policy-container">
      <h1 className="admin-page-title">Kebijakan</h1>
      <button onClick={() => openDialog()} className="add-btn">+</button>

      {policies.length === 0 ? (<p>Belum ada Kebijakan</p>) : 
      (
        <ul className="policy-list admin-item-list">
            {policies.map((policy, index) => (
                <li key={index} className="policy-item admin-item">
                    <div className="policy-item admin-item">
                        <p>{policy.name}</p><br/>
                        <p>Kode : {policy.kode ? policy.kode : "Belum ada kode"}</p>
                    </div>

                    <div className="handle-item-btn">
                        <button onClick={() => openDialog(policy)} className="edit-btn">Edit</button>
                        <button onClick={() => confirmDelete(policy._id)} className="delete-btn">Delete</button>
                    </div>
                </li>
            ))}
        </ul>
      )}

      {isDialogOpen && (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <h2 className="dialog-title">{isEditMode ? "edit kebijakan" : "menambah kebijakan"}</h2>
                <div className="form-item">
                    <label>Nama</label>
                    <input 
                    type="text"
                    placeholder="nama kebijakan..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name:e.target.value})}
                    className={formErrors.name ? "input-error" : ""}
                    />
                    {formErrors.name && <p className="error-text">{formErrors.name}</p>}
                </div>
                <div className="form-item">
                    <label>Kode</label>
                    <input 
                    type="text"
                    placeholder="Kode kebijakan..."
                    value={formData.kode}
                    onChange={(e) => setFormData({...formData, kode:e.target.value})}
                    className={formErrors.kode ? "input-error" : ""}
                    />
                    {formErrors.kode && <p className="error-text">{formErrors.kode}</p>}
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
                    <p>Apakah anda yakin ingin menghapus kebijakan ini?</p>
                </div>
                <div className="dialog-actions">
                    <button onClick={() => setDeleteDialog({isOpen:false, policyId:null})} className="cancel-btn">Batal</button>
                    <button onClick={handleDelete} className="delete-btn">Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
