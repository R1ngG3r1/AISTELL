<?php

namespace App\Modules\Staff\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Staff\Models\Staff;
use App\Modules\Staff\Requests\StaffRequest;
use App\Modules\Staff\Services\StaffService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Kelola petugas (khusus admin): tambah, ubah, aktif/nonaktif, hapus. */
class AdminStaffController extends Controller
{
    public function __construct(private StaffService $staff) {}

    // GET /admin/staff
    public function index(): Response
    {
        return Inertia::render('Admin/Staff/Index', ['staff' => fn () => $this->staff->all()]);
    }

    // POST /admin/staff
    public function store(StaffRequest $request): RedirectResponse
    {
        $this->staff->create($request->validated());

        return back()->with('success', 'Petugas berhasil ditambahkan.');
    }

    // PUT /admin/staff/{staff}
    public function update(StaffRequest $request, Staff $staff): RedirectResponse
    {
        $this->staff->update($staff, $request->validated());

        return back()->with('success', 'Data petugas diperbarui.');
    }

    // DELETE /admin/staff/{staff}
    public function destroy(Staff $staff): RedirectResponse
    {
        if (! $this->staff->delete($staff)) {
            return back()->with('error', 'Petugas pernah ditugaskan pada pesanan, jadi tidak dapat dihapus. Nonaktifkan saja.');
        }

        return back()->with('success', 'Petugas dihapus.');
    }
}
