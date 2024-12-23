"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkers,
  fetchUpdateWorker,
  fetchDeleteWorker,
} from "@/utils/fetchFuntions";
import { SheetDescription } from "@/components/ui/sheet";
import { useCompanyStore } from "@/store/CompanyStore";
import { LoaderCircle } from "lucide-react";
import { FilePenLine } from "lucide-react";
import { Trash } from "lucide-react";
import { X } from "lucide-react";
import { afpOptions, formatRut, meses } from "@/utils/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumericFormat } from "react-number-format";

export default function CreatePayRoll() {
  const { companyId } = useCompanyStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAfp, setSelectedAfp] = useState("");
  const [afpError, setAfpError] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    rut: "",
    position: "",
    email: "",
    sueldoBase: "",
    movilizacion: 0,
    colacion: 0,
    viatico: 0,
    asignacionFamiliar: 0,
    diasTrabajados: "",
    diasAusentes: 0,
    afp: "",
    horasExtras: 0,
    salarioBase: "",
    pagoHorasExtras: "",
    mes: "",
    descuento: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const queryClient = useQueryClient();

  const {
    isPending,
    isError,
    data: employees,
  } = useQuery({
    queryKey: ["workers", companyId],
    queryFn: () => fetchWorkers(companyId),
    staleTime: Infinity,
    enabled: !!companyId,
  });

  useEffect(() => {
    if (!isPending && employees) {
      setFilteredEmployees(employees);
    }
  }, [isPending, employees]);

  const updateWorkerMutation = useMutation({
    mutationFn: fetchUpdateWorker,
    onSuccess: () => {
      queryClient.invalidateQueries(["workers"]);
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error updating worker:", error);
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = employees.filter(
      (employee) =>
        employee?.name?.toLowerCase().includes(term) ||
        employee?.last_name?.toLowerCase().includes(term) ||
        employee?.position?.toLowerCase().includes(term)
    );
    setFilteredEmployees(filtered);
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setFormData((prev) => ({
      ...prev,
      name: employee.name,
      last_name: employee.last_name,
      rut: employee.rut,
      position: employee.position,
      email: employee.email,
      sueldoBase: employee.base_salary,
      diasAusentes: 0,
      afp: {},
      horasExtras: 0,
      movilizacion: 0,
      colacion: 0,
      viatico: 0,
      asignacionFamiliar: 0,
      mes: "",
      descuento: 0,
    }));
    setSelectedAfp("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    if (!selectedAfp) {
      setAfpError('Este campo es requerido.');
      valid = false;
    }
    if (!valid) return;
    setIsLoading(true);
    fetch("/api/pdf", {
      method: "POST",
      body: JSON.stringify(formData),
    }).then((res) => {
      if (res.ok) {
        setIsModalOpen(false);
        setIsLoading(false);
      }
    });
  };

  const handleAfpChange = (value) => {
    const selected = afpOptions.find((option) => option.name === value);
    setFormData((prev) => ({
      ...prev,
      afp: selected,
    }));
    setSelectedAfp(value);
    if (value) {
      setAfpError('');
    }
  };

  if (isPending) return <div>Loading...</div>;

  if (isError) return <div>Error loading employees</div>;

  return (
    <div className="md:p-6">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">
        Gestión de Liquidaciones
      </h2>
      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre, apellido, RUT o cargo"
          value={searchTerm}
          onChange={handleSearch}
          className="pl-8"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead className="min-w-10 break-all hidden md:table-cell">
                RUT
              </TableHead>
              <TableHead className="hidden md:table-cell">Cargo</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="min-w-10 break-all">
                  {employee?.name}
                </TableCell>
                <TableCell className="min-w-10 break-all">
                  {employee?.last_name}
                </TableCell>
                <TableCell className="min-w-10 break-all hidden md:table-cell">
                  {formatRut(employee?.rut)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {employee?.position}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleSelectEmployee(employee)}>
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Generar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {employees.length === 0 && (
        <p className="text-center mt-4 text-muted-foreground">
          No se encontraron empleados.
        </p>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[300px] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {`${selectedEmployee.name} ${selectedEmployee.last_name}`}{" "}
              Información Salarial
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="gap-y-4 grid grid-cols-2 gap-x-2"
          >
            <div>
              <Label htmlFor="diasAusentes">Días Ausentes</Label>
              <NumericFormat
                id="diasAusentes"
                name="diasAusentes"
                value={formData.diasAusentes}
                onChange={handleChange}
                isAllowed={(values) => {
                  const { formattedValue, floatValue } = values;
                  return (
                    formattedValue === "" ||
                    (floatValue >= 0 && floatValue <= 30)
                  );
                }}
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div>
              <Label htmlFor="horasExtras">Horas Extras</Label>
              <NumericFormat
                id="horasExtras"
                name="horasExtras"
                value={formData.horasExtras}
                onChange={handleChange}
                isAllowed={(values) => {
                  const { formattedValue, floatValue } = values;
                  return (
                    formattedValue === "" ||
                    (floatValue >= 0 && floatValue <= 80)
                  );
                }}
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="afp">AFP</Label>
              <Select value={selectedAfp} onValueChange={handleAfpChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona AFP" />
                </SelectTrigger>
                <SelectContent>
                  {afpOptions.map((option) => (
                    <SelectItem key={option.id} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {afpError && <p className="text-red-500 text-sm mt-1">{afpError}</p>}
            </div>
            <div>
              <Label htmlFor="movilizacion">Movilización</Label>
              <NumericFormat
                id="movilizacion"
                name="movilizacion"
                value={formData.movilizacion}
                onChange={handleChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div>
              <Label htmlFor="colacion">Colación</Label>
              <NumericFormat
                id="colacion"
                name="colacion"
                value={formData.colacion}
                onChange={handleChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div>
              <Label htmlFor="viatico">Viático</Label>
              <NumericFormat
                id="viatico"
                name="viatico"
                value={formData.viatico}
                onChange={handleChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div>
              <Label htmlFor="asignacionFamiliar">Asignación Familiar</Label>
              <NumericFormat
                id="asignacionFamiliar"
                name="asignacionFamiliar"
                value={formData.asignacionFamiliar}
                onChange={handleChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <NumericFormat
                id="descuento"
                name="descuento"
                value={formData.descuento}
                onChange={handleChange}
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="mes">Mes</Label>
              <Select
                value={formData.mes}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, mes: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona mes" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes) => (
                    <SelectItem key={mes.id} value={mes.name}>
                      {mes.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="totalSalary">Sueldo base</Label>
              <NumericFormat
                id="totalSalary"
                name="totalSalary"
                value={selectedEmployee?.base_salary}
                disabled
                readOnly
                thousandSeparator="."
                decimalSeparator=","
                prefix="$"
                allowNegative={false}
                customInput={Input}
              />
            </div>
            <div className="col-span-2">
              {isLoading ? (
                <>
                  <LoaderCircle className="mx-auto animate-spin" />
                  <p className="text-center text-muted-foreground">
                    Enviando liquidación...
                  </p>
                </>
              ) : (
                <div className="flex justify-center items-center">
                  <Button type="submit">Enviar Liquidación</Button>
                </div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
