package Reiudemo.demo;


import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;




class PaymentServiceTest {

    private PaymentService paymentService = new PaymentService();

    @Test
    void testCalculateTotal() {
        // 1. Giả lập dữ liệu đầu vào (Given)
        Payment p1 = new Payment(); p1.setAmount(100.0);
        Payment p2 = new Payment(); p2.setAmount(200.0);
        List<Payment> list = Arrays.asList(p1, p2);

        // 2. Chạy hàm cần test (When)
        double result = paymentService.calculateTotal(list);

        // 3. Kiểm tra kết quả có đúng là 300 không (Then)
        assertEquals(300.0, result, "Tổng tiền phải là 300.0");
    }
}
