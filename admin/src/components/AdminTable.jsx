import { useState, useEffect } from 'react'
import Select from 'react-select'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminTable() {
  const [data, setData] = useState([])
  const [missions, setMissions] = useState([])
  const [policies, setPolicies] = useState([])
  const [dimensions, setDimensions] = useState([])
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editIndex, setEditIndex] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    mission:null,
    policy:null,
    dimension:null,
    indicator:null
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [missionRes, policyRes, dimensionRes, indicatorRes, tableRes] =
          await Promise.all([
            axios.get("/api/v1/admin/mission"),
            axios.get("/api/v1/admin/policy"),
            axios.get("/api/v1/admin/dimension"),
            axios.get("/api/v1/admin/indicator"),
            axios.get("/api/v1/admin/table"),
          ]);

        setMissions(missionRes.data.data);
        setPolicies(policyRes.data.data);
        setDimensions(dimensionRes.data.data);
        setIndicators(indicatorRes.data.data);
        setData(tableRes.data.data?.data || []);
      
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
      
      } finally{
        setLoading(false)
      }
    };

    fetchData();
  }, []);

  const handleAddRow = () => {
    if(!formData.mission || !formData.policy || !formData.dimension || !formData.indicator){
      toast.error("semua field harus diisi")
      return
    }

    const selectedPolicy = policies.find(p => p._id === formData.policy.value)
    const selectedDimension = dimensions.find(d => d._id === formData.dimension.value)

    // Hitung jumlah indikator yang sudah ada dalam dimensi yang sama
    const sameDimensionIndicators = data.filter(row => row.dimension._id === formData.dimension.value)
    const nextIndicatorNumber = sameDimensionIndicators.length + 1

    // Buat kode indikator sementara (misalnya berdasarkan jumlah data saat ini)
    const generatedKode = `${selectedPolicy?.kode || ''}.${selectedDimension?.kode || ''}.i${String(nextIndicatorNumber).padStart(2, '0')}`;

    const newRow = {
      mission: { _id: formData.mission.value, name: formData.mission.label },
      policy: { _id: formData.policy.value, name: formData.policy.label, kode: selectedPolicy?.kode || '' },
      dimension: { _id: formData.dimension.value, name: formData.dimension.label, kode: selectedDimension?.kode || '' },
      indicator: { _id: formData.indicator.value, name: formData.indicator.label, kode: `i${nextIndicatorNumber}` },
      kode: generatedKode,
    };
    

    setData([...data, newRow])
    // apakah disini butuh update state?

    setDialogOpen(false)
    setFormData({ mission: null, policy: null, dimension: null, indicator: null });
  }

  const handleDeleteRow = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const handleEditRow = (index) => {
    const row = data[index];
  
    setFormData({
      mission: { value: row.mission._id, label: row.mission.name },
      policy: { value: row.policy._id, label: row.policy.name },
      dimension: { value: row.dimension._id, label: row.dimension.name },
      indicator: { value: row.indicator._id, label: row.indicator.name },
    });
  
    setEditIndex(index);
    setDialogOpen(true);
  };

  const handleUpdateRow = () => {
    if (!formData.mission || !formData.policy || !formData.dimension || !formData.indicator) {
      toast.error("Semua field harus diisi");
      return;
    }
  
    const newData = [...data];
  
    const selectedPolicy = policies.find(p => p._id === formData.policy.value);
    const selectedDimension = dimensions.find(d => d._id === formData.dimension.value);
  
    // Hitung ulang jumlah indikator dalam dimensi yang dipilih
    const sameDimensionIndicators = newData.filter(row => row.dimension._id === formData.dimension.value);
    const nextIndicatorNumber = sameDimensionIndicators.length + 1;
  
    // Buat kode indikator baru
    const generatedKode = `${selectedPolicy?.kode || ''}.${selectedDimension?.kode || ''}.i${String(nextIndicatorNumber).padStart(2, '0')}`;
  
    // Update data di index yang diedit
    newData[editIndex] = {
      mission: { _id: formData.mission.value, name: formData.mission.label },
      policy: { _id: formData.policy.value, name: formData.policy.label, kode: selectedPolicy?.kode || '' },
      dimension: { _id: formData.dimension.value, name: formData.dimension.label, kode: selectedDimension?.kode || '' },
      indicator: { _id: formData.indicator.value, name: formData.indicator.label, kode: `i${nextIndicatorNumber}` },
      kode: generatedKode, // Update kode indikator setiap kali ada perubahan
    };

    toast.success("Berhasil mengubah data!")
  
    setData(newData);
    setDialogOpen(false);
    setEditIndex(null);
    setFormData({ mission: null, policy: null, dimension: null, indicator: null });
  };  
  

  const handleSaveToBackend = async () => {
    try {
      await axios.post("/api/v1/admin/table", {rows:data})
      toast.success("Berhasil menyimpan data")

      // Refresh data dari backend (apakah ini cara yang efisien?)
      const tableRes = await axios.get("/api/v1/admin/table");
      setData(tableRes.data.data?.data || []);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data");
    }
  }

  if(loading) return <div>loading...</div>
  if(error) return <div className='error-container'><p>{error}</p></div>

  return (
    <div className="table-data-container">
      <button onClick={handleSaveToBackend} className='save-btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>  
      </button>     

      <table className='all-data-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Misi</th>
            <th>Kebijakan</th>
            <th>Dimensi</th>
            <th>Indikator</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.kode}</td>
              <td>{row.mission.name}</td>
              <td>{row.policy.name}</td>
              <td>{row.dimension.name}</td>
              <td>{row.indicator.name}</td>
              <td>
                <button className='edit-btn table-row-edit' onClick={() => handleEditRow(index)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></button>
              </td>
              <td>
                <button className='delete-btn table-row-delete' onClick={() => handleDeleteRow(index)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table> 
      <button className='add-btn' onClick={() => setDialogOpen(true)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg></button>

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="form-item">
              <Select
              options={missions.map((m) => ({ value: m._id, label: m.name }))}
              onChange={(selected) => setFormData((prev) => ({ ...prev, mission: selected }))}
              placeholder="Pilih Misi"
            />
            </div>
            
            <div className="form-item">
              <Select
              options={policies.map((p) => ({ value: p._id, label: p.name }))}
              onChange={(selected) => setFormData((prev) => ({ ...prev, policy: selected }))}
              placeholder="Pilih Kebijakan"
            />
            </div>
            <div className="form-item">
              <Select
              options={dimensions.map((d) => ({ value: d._id, label: d.name }))}
              onChange={(selected) => setFormData((prev) => ({ ...prev, dimension: selected }))}
              placeholder="Pilih Dimensi"
            />

            </div>
            <div className="form-item">
              <Select
              options={indicators.map((i) => ({ value: i._id, label: i.name }))}
              onChange={(selected) => setFormData((prev) => ({ ...prev, indicator: selected }))}
              placeholder="Pilih Indikator"
            />
            </div>

            <div className="dialog-actions">
              <button onClick={() => setDialogOpen(false)} className='cancel-btn'>
                Batal
              </button>
              {editIndex !== null ? (
                <button onClick={handleUpdateRow}>
                  Update
                </button>
              ) : (
                <button onClick={handleAddRow}>
                  Tambah
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
