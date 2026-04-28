package Reiudemo.demo; // Đảm bảo dòng này giống hệt file DemoApplication.java

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    public double calculateTotal(List<Payment> payments) {
        if (payments == null) return 0;
        return payments.stream().mapToDouble(Payment::getAmount).sum();
    }
}
