<?php

namespace App\Modules\Staff\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Models\Order;
use App\Modules\Staff\Models\Staff;
use App\Modules\Staff\Requests\AssignStaffRequest;
use App\Modules\Staff\Services\StaffService;
use Illuminate\Http\RedirectResponse;

/** Menugaskan petugas pada pesanan (khusus admin). */
class OrderStaffController extends Controller
{
    public function __construct(private StaffService $staff) {}

    // PUT /admin/orders/{order}/staff   body: { staff_id: 3 | null }
    public function update(AssignStaffRequest $request, Order $order): RedirectResponse
    {
        $staff = $request->validated('staff_id') ? Staff::findOrFail($request->validated('staff_id')) : null;

        $this->staff->assign($order, $staff);

        return back()->with('success', $staff ? "{$staff->name} ditugaskan pada pesanan #{$order->id}." : 'Petugas dilepas dari pesanan.');
    }
}
